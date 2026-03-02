import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IAnnotations,
  IAnnotationsCopyNumber,
  IAnnotationsReportableSnvs,
  IArmRanges,
  ICytobandCN,
  ICytogeneticsData,
  ISampleCytoband,
} from 'Models/Curation/Cytogenetics/Cytogenetics.model';
import { ICreateCytobandBody } from 'Models/Curation/Cytogenetics/Requests/CreateCytobandBody.model';
import { IGetAverageCopyNumberQuery } from 'Models/Curation/Cytogenetics/Requests/GetAverageCopyNumberQueryDTO.model';
import { IGetChromosomeBandsQuery } from 'Models/Curation/Cytogenetics/Requests/GetChromosomeBandsQuery.model';
import { IGetCytobandsQuery } from 'Models/Curation/Cytogenetics/Requests/GetCytobandsQuery.model';
import { IUpdateCytobandBody } from 'Models/Curation/Cytogenetics/Requests/UpdateCtyobandBody.model';
import { IUpdateCytoBody } from 'Models/Curation/Cytogenetics/Requests/UpdateCytoBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPatient } from 'Utilities/query/accessControl/withPatient.util';
import { filterClassification } from 'Utilities/query/classification.util';

@Injectable()
export class CytogeneticsClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    variant: 'somatic' | 'germline',
  ) {
    this.variant = variant;
  }

  private readonly variant: 'somatic' | 'germline' = 'somatic';

  private isSomatic = this.variant === 'somatic';

  private cytobandsTable = this.isSomatic ? 'zcc_curated_sample_somatic_cytobandcnv' : 'zcc_curated_sample_germline_cytobandcnv';

  private armsTable = this.isSomatic ? 'zcc_curated_sample_somatic_armcnv' : 'zcc_curated_sample_germline_armcnv';

  private armCountsTable = this.isSomatic ? 'zcc_curated_somatic_armcnv_counts' : 'zcc_curated_germline_armcnv_counts';

  public getCytogeneticsData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    return this.getArmBaseQuery(user)
      .where('a.biosample_id', biosampleId);
  }

  public getCytogeneticsByChromosome(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    return this.getArmBaseQuery(user)
      .where('a.biosample_id', biosampleId)
      .andWhere('a.chr', variantId);
  }

  private getArmBaseQuery(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        chr: 'a.chr',
        arm: 'a.arm',
        cnType: 'a.cn_type',
        sex: 'patient.sex',
        cytoband: 'a.cytoband',
        avgCN: 'a.avecopynumber',
        aveMinMinorAlleleCN: 'a.aveminminorallelecn',
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',
        researchCandidate: 'a.research_candidate',

        // counts
        reportedCount: 'd.reported_count',
        targetableCount: 'd.targetable_count',
      })
      .from<ICytogeneticsData[]>({ a: this.armsTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .modify(withPatient, 'innerJoin', user, 'biosample.patient_id')
      .leftJoin(
        { d: this.armCountsTable },
        function customAndOn() {
          this.on('d.chr', 'a.chr')
            .andOn('d.arm', 'a.arm')
            .andOn('d.cn_type', 'a.cn_type');
        },
      );
  }

  public async getCytobands(
    biosampleId: string,
    query: IGetCytobandsQuery,
    user: IUserWithMetadata,
  ): Promise<ISampleCytoband[]> {
    return this.knex
      .select<ISampleCytoband[]>({
        chr: 'a.chr',
        arm: 'a.arm',
        cytoband: 'a.cytoband',
        avgCN: 'a.avecopynumber',
        customCn: 'a.custom_cn',
        cnType: 'a.cn_type',
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',
      })
      .from({ a: this.cytobandsTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .where('a.biosample_id', biosampleId)
      .andWhere(function filters() {
        if (query.chr) {
          this.andWhere('a.chr', query.chr);
        }
        if (query.arm) {
          this.andWhere('a.arm', query.arm);
        }
        if (query.reportable !== undefined) {
          this.where('a.reportable', query.reportable);
        }
        if (query.targetable !== undefined) {
          this.andWhere('a.targetable', query.targetable);
        }
      })
      .modify(filterClassification, 'a.classification', query.isClassified);
  }

  public async createCytoband(
    biosampleId: string,
    newCytobandBody: ICreateCytobandBody,
  ): Promise<number> {
    const {
      customCn,
      cnType,
      ...rest
    } = newCytobandBody;
    return this.knex
      .insert({
        biosample_id: biosampleId,
        custom_cn: customCn,
        cn_type: cnType,
        ...rest,
      })
      .into(this.cytobandsTable);
  }

  public async updateCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
    {
      customCn,
      cnType,
      ...rest
    }: IUpdateCytobandBody,
  ): Promise<number> {
    return this.knex.update(
      {
        custom_cn: customCn,
        cn_type: cnType,
        ...rest,
      },
    )
      .from(this.cytobandsTable)
      .where('biosample_id', biosampleId)
      .andWhere('chr', chr)
      .andWhere('cytoband', cytoband);
  }

  public async deleteCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
  ): Promise<number> {
    return this.knex.delete()
      .from(this.cytobandsTable)
      .where('biosample_id', biosampleId)
      .andWhere('chr', chr)
      .andWhere('cytoband', cytoband);
  }

  public async updateCytogenetics(
    biosampleId: string,
    {
      chr,
      arm,
      cnType,
      researchCandidate,
      ...rest
    }: IUpdateCytoBody,
  ): Promise<number> {
    return this.knex(this.armsTable)
      .where('biosample_id', biosampleId)
      .andWhere('chr', chr)
      .andWhere('arm', arm)
      .update({
        cn_type: cnType,
        research_candidate: researchCandidate,
        ...rest,
      });
  }

  public async getChromosomeBands(
    query: IGetChromosomeBandsQuery,
  ): Promise<IArmRanges[]> {
    return this.knex
      .select({
        chr: 'chromosome',
        chromosomeBand: this.knex.raw('CONCAT(REPLACE(chromosome, \'chr\', \'\'), name)'),
      })
      .from('ucsc_chromosome_bands')
      .andWhere(function filters() {
        if (query.chr) {
          this.andWhere('chromosome', query.chr);
        }
        if (query.arm) {
          this.andWhere('name', 'like', `${query.arm}%`);
        }
      })
      .orderBy('name', query.arm === 'p' ? 'desc' : 'asc')
      .groupBy('chromosome', 'name');
  }

  // Functions only utilised by Somatic Cytogenetics variant
  public async getAnnotations(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const copyNumber = await this.knex
      .select({
        chr: 'a.chromosome',
        start: 'a.start',
        end: 'a.end',
        cn: 'a.copyNumber',
        lohValue: 'a.minorAlleleCopyNumber',
      })
      .from<IAnnotationsCopyNumber[]>({ a: 'zcc_purple_sample_somatic_cnv' })
      .modify(withBiosample, 'innerJoin', user, 'a.sampleId')
      .where('a.sampleId', biosampleId);

    const reportableSnvs = await this.knex
      .select({
        chr: 'b.chr',
        gene: 'c.gene',
        start: 'b.pos',
        end: 'b.pos',
        hgvs: 'b.hgvs',
        pathclass: 'a.pathclass',
      })
      .from<IAnnotationsReportableSnvs[]>({
        a: 'zcc_curated_sample_somatic_snv',
      })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_curated_snv' }, 'b.variant_id', 'a.variant_id')
      .leftJoin({ c: 'zcc_genes' }, 'c.gene_id', 'b.gene_id')
      .modify(filterClassification, 'a.classification', true)
      .andWhere('a.biosample_id', biosampleId);

    return {
      copyNumber,
      reportableSnvs,
    };
  }

  public async getAnnotationsByChromosome(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const copyNumber = await this.knex
      .select({
        chr: 'a.chromosome',
        start: 'a.start',
        end: 'a.end',
        cn: 'a.copyNumber',
        lohValue: 'a.minorAlleleCopyNumber',
      })
      .from<IAnnotationsCopyNumber[]>({ a: 'zcc_purple_sample_somatic_cnv' })
      .modify(withBiosample, 'innerJoin', user, 'a.sampleId')
      .where('a.sampleId', biosampleId)
      .andWhere('a.chromosome', variantId);

    const reportableSnvs = await this.knex
      .select({
        chr: 'b.chr',
        gene: 'c.gene',
        start: 'b.pos',
        end: 'b.pos',
        hgvs: 'b.hgvs',
        pathclass: 'a.pathclass',
      })
      .from<IAnnotationsReportableSnvs[]>({
        a: 'zcc_curated_sample_somatic_snv',
      })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_curated_snv' }, 'b.variant_id', 'a.variant_id')
      .leftJoin({ c: 'zcc_genes' }, 'c.gene_id', 'b.gene_id')
      .where('a.reportable', true)
      .andWhere('a.biosample_id', biosampleId)
      .andWhere('b.chr', variantId);

    return {
      copyNumber,
      reportableSnvs,
    };
  }

  public async getAverageCopyNumber(
    biosampleId: string,
    query: IGetAverageCopyNumberQuery,
    user: IUserWithMetadata,
  ): Promise<ICytobandCN> {
    const {
      chr, arm, start, end,
    } = query;
    const subQuery = this.knex
      .select({
        biosampleId: 'sampleId',
        chr: 'chromosome',
        arm: this.knex.raw("if (chromosomeBand like '%p%', 'p', 'q')"),
        cband: this.knex.raw("CONCAT(REPLACE(chromosome,'chr',''), chromosomeBand)"),
        avecn: this.knex.raw('round((AVG(minCopyNumber)+AVG(maxCopyNumber))/2,2)'),
        mincn: this.knex.raw('round(Min(minCopyNumber), 2)'),
        maxcn: this.knex.raw('round(MAX(maxCopyNumber), 2)'),
      })
      .from('purple.geneCopyNumber')
      .modify(withBiosample, 'innerJoin', user, 'sampleId')
      .where('sampleId', biosampleId)
      .andWhere('chromosome', chr)
      .andWhere('chromosomeBand', 'like', `%${arm}%`)
      .andWhereRaw("REPLACE(chromosomeBand, ?, '') <= ?", [arm, end])
      .andWhereRaw("REPLACE(chromosomeBand, ?, '') >= ?", [arm, start])
      .groupBy(['chromosome', 'arm', 'cband'])
      .as('T1');

    return this.knex
      .select({
        biosampleId: 'biosampleId',
        chr: 'chr',
        arm: 'arm',
        cytoband: this.knex.raw("GROUP_CONCAT(DISTINCT cband separator ';')"),
        avgCN: this.knex.raw('ROUND(AVG(avecn),2)'),
        minCN: this.knex.raw('round(Min(mincn), 2)'),
        maxCN: this.knex.raw('round(MAX(maxcn), 2)'),
      })
      .from(subQuery)
      .groupBy(['biosampleId', 'chr', 'arm'])
      .first();
  }
}
