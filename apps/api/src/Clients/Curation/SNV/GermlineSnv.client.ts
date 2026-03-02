import { TabixIndexedFile } from '@gmod/tabix';
import { Inject, Injectable } from '@nestjs/common';
import { Fetcher, RemoteFile } from 'generic-filehandle';
import { Knex } from 'knex';
import {
  IGermlineSnv, IGermlineSnvCounts, IGermlineSnvUpdatableFields, IReportableGermlineSNV,
} from 'Models/Curation/GermlineSnv/CuratedSampleGermlineSnv.model';
import { IChromPosRefAlt } from 'Models/Curation/GermlineSnv/Requests/ChromosomePosition.model';
import { ICuratedSampleGermlineSnvsQuery } from 'Models/Curation/GermlineSnv/Requests/CuratedSampleGermlineSnvQuery.model';
import { GetVariantZygosityQuery, IGetVariantZygosityResp } from 'Models/Curation/GermlineSnv/Requests/GetVariantZygosityQuery.model';
import { IUpdateSampleGermlineSnv } from 'Models/Curation/GermlineSnv/Requests/UpdateSampleGermlineSnvBody.model';
import { Chromosome, HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { S3Service } from 'Modules/S3/S3.service';
import fetch from 'node-fetch';
import { GenesService } from 'Services/Curation/Genes/Genes.service';
import { FileTrackerService } from 'Services/FileTracker/FileTracker.service';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { filterClassification } from 'Utilities/query/classification.util';
import { isClassified } from 'Utilities/query/isClassified.util';
import isHighPathclass from 'Utilities/query/isHighPathclass.util';
import getPathclassScore from 'Utilities/sorting/getPathclassScore';
import getReportableScore from 'Utilities/sorting/getReportableScore';
import mapToGermlineSNV from 'Utilities/transformers/tabix/mapToGermlineSNV.util';
import mapToSNV from 'Utilities/transformers/tabix/mapToSNV.util';
import mapToSNVAnno from 'Utilities/transformers/tabix/mapToSNVAnno.util';
import { toChromosomeNumber } from 'Utilities/transformers/toChromosomeNumber.util';

@Injectable()
export class GermlineSnvCurationClient {
  private sampleGermlineSnvTable = 'zcc_curated_sample_germline_snv';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    @Inject(S3Service) private readonly s3: S3Service,
    @Inject(GenesService) private readonly geneService: GenesService,
    @Inject(FileTrackerService) private readonly fileTrackerService: FileTrackerService,
  ) {}

  public async getReportableGermlineSnvs(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IReportableGermlineSNV[]> {
    const query = this.knex.select({
      variantId: 'snv.variant_id',
      biosampleId: 'snv.biosample_id',
      gene: 'gene.gene',
      chr: 'gene.chromosome_hg38',
      hgvs: 'curatedSnv.hgvs',
      altad: 'snv.altad',
      depth: 'snv.depth',
      pathclass: 'snv.pathclass',
      genotype: 'snv.genotype',
      zygosity: 'snv.zygosity',
      reportable: 'snv.reportable',
      classification: 'snv.classification',
      targetable: 'snv.targetable',
    })
      .from<IReportableGermlineSNV[]>({ snv: this.sampleGermlineSnvTable })
      .modify(withBiosample, 'innerJoin', user, 'snv.biosample_id')
      .leftJoin({ curatedSnv: 'zcc_curated_snv' }, 'snv.variant_id', 'curatedSnv.variant_id')
      .leftJoin({ gene: 'zcc_genes' }, 'curatedSnv.gene_id', 'gene.gene_id')
      .where('snv.biosample_id', biosampleId)
      .modify(filterClassification, 'snv.reportable', true);

    return query;
  }

  public async getSampleHeliumSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    const min = await this.knex({ snv: this.sampleGermlineSnvTable })
      .where('snv.biosample_id', biosampleId)
      .modify(withBiosample, 'innerJoin', user, 'snv.biosample_id')
      .min('snv.pathscore as min')
      .first();

    const max = await this.knex({ snv: this.sampleGermlineSnvTable })
      .where('snv.biosample_id', biosampleId)
      .modify(withBiosample, 'innerJoin', user, 'snv.biosample_id')
      .max('snv.pathscore as max')
      .first();

    const avg = await this.knex({ snv: this.sampleGermlineSnvTable })
      .where('snv.biosample_id', biosampleId)
      .modify(withBiosample, 'innerJoin', user, 'snv.biosample_id')
      .avg('snv.pathscore as avg')
      .first();

    return {
      biosampleId,
      minScore: min.min,
      maxScore: max.max,
      avgScore: avg.avg,
    };
  }

  public async getGermlineSnvs(
    biosampleId: string,
    filters: ICuratedSampleGermlineSnvsQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<IGermlineSnv[]> {
    const snvs = await this.getAllGermlineSnvs(
      biosampleId,
      filters,
      user,
    );
    const results = snvs
      .sort((a, b) => this.sortSnvs(filters, a, b))
      .slice((page - 1) * limit, ((page - 1) * limit) + limit);
    const counts = await this.getCountsByGeneIds(results.map((snv) => snv.variantId));
    const anno = await this.getAnnoByVariantIds(results.map((snv) => snv.variantId));
    return results.map((snv) => ({
      ...snv,
      sampleCount: counts.find((c) => c.variantId === snv.variantId)?.sampleCount || 0,
      cancerTypes: counts.find((c) => c.variantId === snv.variantId)?.cancerTypes || 0,
      reported_count: counts.find((c) => c.variantId === snv.variantId)?.reportedCount || 0,
      targetable_count: counts.find((c) => c.variantId === snv.variantId)?.targetableCount || 0,
      pecan: anno.find((p) => p.variantId === snv.variantId)?.pecan || null,
      heliumScore: anno.find((p) => p.variantId === snv.variantId)?.heliumScore || 0,
      heliumReason: anno.find((p) => p.variantId === snv.variantId)?.heliumReason || '',
    }));
  }

  public async getCuratedSampleGermlineSnvsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineSnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const snvs = await this.getAllGermlineSnvs(
      biosampleId,
      filters,
      user,
    );
    return snvs.length;
  }

  public async getCuratedSampleGermlineSnvByVariantId(
    biosampleId: string,
    cpra: IChromPosRefAlt,
    user: IUserWithMetadata,
  ): Promise<IGermlineSnv> {
    const lines = await this.getTabixLines(
      biosampleId,
      user,
      cpra.chromosome,
      cpra.position - 1,
      cpra.position,
      true,
    );
    const header = lines[0];
    const variant = lines.slice(1)
      .map((l) => mapToGermlineSNV(biosampleId, header.split('\t'), l.split('\t')))
      .find((v) => (
        v.snvRef === cpra.ref
        && v.alt === cpra.alt
        && v.chr === cpra.chromosome
        && v.pos === cpra.position
      ));

    if (variant) {
      const updatables = await this.getUpdatedRows(
        biosampleId,
        user,
        [variant.variantId],
      );
      return this.geneService.getGenes({ gene: variant.gene }, 1, 1)
        .then((genes) => {
          const gene = genes[0];
          return {
            ...variant,
            geneId: gene?.geneId ?? null,
            zygosity: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.zygosity ?? null,
            classification: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.classification ?? null,
            reportable: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.reportable ?? null,
            targetable: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.targetable ?? null,
            pathclass: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.pathclass ?? null,
            phenotype: updatables.find(
              (snv) => snv.variantId === variant.variantId,
            )?.phenotype ?? null,
            geneLists: gene?.prismclass ?? null,
          };
        });
    }
    return null;
  }

  public async getVariantZygosity(
    biosampleId: string,
    { biosampleId: tumourBiosampleId, variantIds }: GetVariantZygosityQuery,
    user: IUserWithMetadata,
  ): Promise<IGetVariantZygosityResp[]> {
    return this.knex
      .select({
        variantId: 'a.variant_id',
        zygosity: 'a.zygosity',
        somaticSnvZygosity: 'b.zygosity',
      })
      .from({ a: this.sampleGermlineSnvTable })
      .leftJoin({ b: 'zcc_curated_sample_somatic_snv' }, 'a.variant_id', 'b.variant_id')
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .where('a.biosample_id', biosampleId)
      .whereIn('a.variant_id', variantIds)
      .where(function customBuilder() {
        if (tumourBiosampleId) {
          this.where('b.biosample_id', tumourBiosampleId);
        }
      });
  }

  public async updateCuratedSampleGermlineSnvByVariantId(
    {
      pecan,
      chromosome,
      position,
      ref,
      alt,
      ...rest
    }: IUpdateSampleGermlineSnv,
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<number> {
    const lines = await this.getTabixLines(
      biosampleId,
      user,
      chromosome,
      position - 1,
      position,
      true,
    );
    const variantLine = lines
      .slice(1)
      .find((l) => {
        const snv = mapToGermlineSNV(biosampleId, lines[0]?.split('\t') || [], l.split('\t'));
        return snv.snvRef === ref
          && snv.alt === alt
          && snv.chr === chromosome
          && snv.pos === position;
      });

    if (!variantLine) return null;
    const germSnv = mapToGermlineSNV(biosampleId, lines[0]?.split('\t') || [], variantLine?.split('\t') || []);
    const annoData = mapToSNVAnno(lines[0]?.split('\t') || [], variantLine?.split('\t') || []);
    const genes = await this.geneService.getGenes({ gene: germSnv.gene }, 1, 1);
    const snvData = mapToSNV(genes[0].geneId, lines[0]?.split('\t') || [], variantLine?.split('\t') || []);

    const trx = await this.knex.transaction();
    try {
      await trx('zcc_curated_snv')
        .insert(snvData)
        .onConflict()
        .ignore();

      await trx('zcc_curated_snv_anno')
        .insert(annoData)
        .onConflict()
        .ignore();

      let result = [];
      // update pecan first
      if (pecan !== undefined) {
        result = await trx({ snv: 'zcc_curated_snv_anno' })
          .andWhere('snv.variant_id', germSnv.variantId)
          .update({
            pecan,
          });
      }

      const mergeCols: string[] = [];
      for (const key of Object.keys(rest)) {
        if (rest[key] !== undefined) {
          const mappedKey = key === 'researchCandidate' ? 'research_candidate' : key;
          mergeCols.push(mappedKey);
        }
      }

      if (mergeCols.length > 0) {
        const { researchCandidate, ...others } = rest;
        result = await trx(this.sampleGermlineSnvTable)
          .insert({
            variant_id: germSnv.variantId,
            biosample_id: biosampleId,
            depth: germSnv.depth,
            altad: germSnv.altad,
            genotype: germSnv.genotype,
            platforms: 'W',
            research_candidate: researchCandidate,
            ...others,
          })
          .onConflict()
          .merge(mergeCols);
      }
      // update remaining columns second
      await trx.commit();
      return result[0];
    } catch {
      trx.rollback();
    }

    return null;
  }

  public clearSnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.knex(this.sampleGermlineSnvTable)
      .update({ pathclass: null })
      .whereNotNull('pathclass')
      .where('biosample_id', biosampleId);
  }

  /** HELPER FUNCTIONS  */
  private fileWhereBuilder(
    index = false,
  ) {
    return (qb: Knex.QueryBuilder): void => {
      qb
        .where('type', index ? 'index' : 'main')
        .where('variant_type', 'Germline_SNV');
    };
  }

  private async getTabixFile(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<TabixIndexedFile | null> {
    const { key: iKey, bucket: iBucket } = await this.fileTrackerService.getNetappKey(
      user,
      'zcc_zd_tsv',
      this.fileWhereBuilder(true),
      biosampleId,
    );
    const { key, bucket } = await this.fileTrackerService.getNetappKey(
      user,
      'zcc_zd_tsv',
      this.fileWhereBuilder(),
      biosampleId,
    );
    const indexFileUrl = await this.s3.getS3Url(iKey, iBucket);
    const mainFileUrl = await this.s3.getS3Url(key, bucket);

    if (indexFileUrl && mainFileUrl) {
      const tbiIndexed = new TabixIndexedFile({
        filehandle: new RemoteFile(mainFileUrl, { fetch: fetch as unknown as Fetcher }),
        tbiFilehandle: new RemoteFile(indexFileUrl, { fetch: fetch as unknown as Fetcher }),
      });
      return tbiIndexed;
    }
    return null;
  }

  private async getTabixLines(
    biosampleId: string,
    user: IUserWithMetadata,
    chromosome: string,
    positionStart: number,
    positionEnd?: number,
    includeHeader = false,
  ): Promise<string[]> {
    const tbiIndexed = await this.getTabixFile(biosampleId, user);
    if (tbiIndexed) {
      const lines: string[] = [];
      if (includeHeader) {
        const header = await tbiIndexed.getHeader();
        lines.push(header);
      }
      await tbiIndexed.getLines(
        chromosome,
        positionStart,
        positionEnd,
        (line) => lines.push(line),
      );
      return lines;
    }
    return [];
  }

  private async getUpdatedRows(
    biosampleId: string,
    user: IUserWithMetadata,
    variantIds: string[] = [],
  ): Promise<IGermlineSnvUpdatableFields[]> {
    return this.knex({ snv: 'zcc_curated_sample_germline_snv' })
      .select({
        variantId: 'snv.variant_id',
        zygosity: 'snv.zygosity',
        classification: 'snv.classification',
        reportable: 'snv.reportable',
        targetable: 'snv.targetable',
        pathclass: 'snv.pathclass',
        phenotype: 'snv.phenotype',
        researchCandidate: 'snv.research_candidate',
      })
      .where('snv.biosample_id', biosampleId)
      .modify(withBiosample, 'innerJoin', user, 'snv.biosample_id')
      .where(function specificVariants() {
        if (variantIds.length > 0) {
          this.whereIn('snv.variant_id', variantIds);
        }
      });
  }

  private async getCountsByGeneIds(
    variantIds: string[],
  ): Promise<IGermlineSnvCounts[]> {
    return this.knex('zcc_curated_germline_snv_counts')
      .select({
        variantId: 'variant_id',
        sampleCount: 'sample_count',
        cancerTypes: 'cancer_types',
        reportedCount: 'reported_count',
        targetableCount: 'targetable_count',
      })
      .whereIn('variant_id', variantIds);
  }

  private async getGeneByVariantIds(
    variantIds: string[],
  ): Promise<string[]> {
    return this.knex
      .select({
        gene: 'gene.gene',
      })
      .from({ gene: 'zcc_genes' })
      .whereIn(
        'gene.gene_id',
        this.knex
          .select('gene_id')
          .from('zcc_curated_snv')
          .whereIn('variant_id', variantIds),
      )
      .pluck('gene.gene');
  }

  private async getAnnoByVariantIds(
    variantIds: string[],
  ): Promise<Pick<IGermlineSnv, 'variantId' | 'pecan' | 'heliumScore' | 'heliumReason'>[]> {
    return this.knex('zcc_curated_snv_anno')
      .select({
        variantId: 'variant_id',
        pecan: 'pecan',
        heliumScore: 'germline_helium_score',
        heliumReason: 'germline_helium_reason',
      })
      .whereIn('variant_id', variantIds);
  }

  private matchesFilters(
    snv: IGermlineSnv,
    filters: ICuratedSampleGermlineSnvsQuery,
  ): boolean {
    const defaultFilter = (
      filters.defaultFilter
      && (
        isClassified(snv.classification)
        || snv.reportable
        || isHighPathclass(snv.pathclass)
      )
    );

    const gene = !(filters.gene?.length > 0) || (
      filters.gene?.length > 0 && filters.gene.includes(snv.gene)
    );
    const variantId = !(filters.variantIds?.length > 0) || (
      filters.variantIds.includes(snv.variantId)
    );
    const pathclass = !(filters.classpath?.length > 0) || (
      filters.classpath?.length > 0 && filters.classpath.includes(snv.pathclass)
    );
    const consequence = !(filters.consequence?.length > 0) || (
      filters.consequence?.length > 0 && (
        filters.consequence.some((c) => snv.consequence.split('&').includes(c))
      )
    );
    const gnomadFreq = !filters.gnomad || (
      snv.gnomadAFGenomePopmax === null
      || (
        snv.gnomadAFGenomePopmax >= filters.gnomad[0]
        && snv.gnomadAFGenomePopmax <= filters.gnomad[1]
      )
    );
    const vaf = !filters.vaf || (
      (snv.altad / snv.depth) >= filters.vaf[0]
      && (snv.altad / snv.depth) <= filters.vaf[1]
    );
    const reads = !filters.reads || (
      snv.altad >= filters.reads[0] && snv.altad <= filters.reads[1]
    );
    const includeFailed = !snv.failed || (snv.failed && filters.vcf);
    const reportable = filters.reportable !== undefined
      ? snv.reportable === filters.reportable : true;
    const targetable = filters.targetable !== undefined
      ? snv.targetable === filters.targetable : true;
    const classified = !filters.isClassified || isClassified(snv.classification);

    return defaultFilter || (
      gene
      && variantId
      && pathclass
      && consequence
      && gnomadFreq
      && vaf
      && reads
      && includeFailed
      && reportable
      && targetable
      && classified
    );
  }

  private sortSnvs(
    filters: ICuratedSampleGermlineSnvsQuery,
    a: IGermlineSnv,
    b: IGermlineSnv,
  ): number {
    const mapping: { [key: string]: (snv: IGermlineSnv) => string | number } = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Helium Score': (snv) => snv.heliumScore,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Chromosome: (snv) => toChromosomeNumber(snv.chr as Chromosome),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Gene Start': (snv) => snv.pos,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      VAF: (snv) => (snv.altad) / (snv.depth),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Reads: (snv) => snv.altad,
    };
    for (const [index, column] of (filters.sortColumns?.entries() || [])) {
      const aValue = mapping[column](a);
      const bValue = mapping[column](b);
      let sortValue = 0;
      if (aValue < bValue) sortValue = -1;
      if (aValue > bValue) sortValue = 1;
      if (sortValue !== 0) {
        return filters.sortDirections[index] === 'desc'
          ? sortValue * -1
          : sortValue;
      }
    }
    const aReportableScore = getReportableScore(a);
    const bReportableScore = getReportableScore(b);

    if (aReportableScore !== bReportableScore) return bReportableScore - aReportableScore;

    const aPathClassScore = getPathclassScore(a);
    const bPathClassScore = getPathclassScore(b);

    if (aPathClassScore !== bPathClassScore) return bPathClassScore - aPathClassScore;

    return a.gene.localeCompare(b.gene) || a.variantId.localeCompare(b.variantId);
  }

  private async getAllGermlineSnvs(
    biosampleId: string,
    filters: ICuratedSampleGermlineSnvsQuery,
    user: IUserWithMetadata,
  ): Promise<IGermlineSnv[]> {
    const tbiIndexed = await this.getTabixFile(biosampleId, user);
    if (!tbiIndexed) return [];

    const updatedRows = await this.getUpdatedRows(biosampleId, user);
    const additionalGenes = await this.getGeneByVariantIds(updatedRows.map((row) => row.variantId));
    const filteredGenes = await this.geneService.getFilteredGenes([
      ...filters.gene,
      // by default need to also show reportable / pathogenic variants
      ...(filters.defaultFilter ? additionalGenes : []),
    ]);

    const snvs: IGermlineSnv[] = [];
    const promises: Promise<void>[] = [];
    const header = await tbiIndexed.getHeader();
    for (const gene of filteredGenes.validGenes) {
      if (
        (!filters?.search || gene.gene.toLowerCase().includes(filters.search.toLowerCase()))
        && (
          !(filters?.chromosome?.length > 0)
          || filters.chromosome.includes(gene.chromosome.replace('chr', '') as Chromosome)
        )
      ) {
        promises.push(
          tbiIndexed.getLines(gene.chromosome, gene.geneStart, gene.geneEnd, (line) => {
            const snvRaw = mapToGermlineSNV(biosampleId, header.split('\t'), line.split('\t'));
            if (snvRaw.gene === gene.gene && snvRaw.hgvs) {
              const snv = {
                ...snvRaw,
                geneId: gene.geneId,
                geneLists: gene.prismclass,
                zygosity: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.zygosity ?? null,
                classification: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.classification ?? null,
                reportable: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.reportable ?? null,
                targetable: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.targetable ?? null,
                pathclass: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.pathclass ?? null,
                phenotype: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.phenotype ?? null,
                researchCandidate: updatedRows.find(
                  (variant) => variant.variantId === snvRaw.variantId,
                )?.researchCandidate,
              };
              if (this.matchesFilters(snv, filters)) {
                snvs.push(snv);
              }
            }
          }),
        );
      }
    }
    await Promise.all(promises);

    return snvs;
  }
}
