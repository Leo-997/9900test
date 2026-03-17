import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IExtendedGene, IFilteredGenes, IGene, IGeneList, IGeneListRaw, IInvalidGene,
} from 'Models/Curation/Genes/Gene.model';
import { AddGeneListBodyDTO } from 'Models/Curation/Genes/Requests/AddGeneListBody.model';
import { IGetAllGeneListsQuery, IGetAllGenesQuery, IGetGenesByIdsQuery } from 'Models/Curation/Genes/Requests/GetAllGenesQuery.model';
import { IUser } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withPrismGeneListImportance } from 'Utilities/query/Importance.util';
import { geneCustomOrder } from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class GenesClient {
  private genesTable = 'zcc_genes';

  private geneListsTable = 'zcc_gene_lists';

  private geneListMapTable = 'zcc_list_contains_gene';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getGenes(
    { gene, geneId }: IGetAllGenesQuery,
    page = 1,
    limit = 100,
    getSampleGenes = undefined,
  ): Promise<IGene[]> {
    let currentPage = page;
    if (page < 1) {
      currentPage = 1;
    }
    const offset = (currentPage - 1) * limit;

    const orderByQuery = gene.trim()
      ? `${geneCustomOrder('gene')}, geneListImportance asc, gene asc`
      : 'geneListImportance asc, gene asc';

    let query = this.knex
      .select({
        geneId: 'a.gene_id',
        gene: 'a.gene',
        chromosome: 'a.chromosome_hg38',
        geneStart: 'a.start_hg38',
        geneEnd: 'a.end_hg38',
        chromosomeBand: 'a.chromosomeBand_hg38',
        prismclass: 'b.gene_lists',
      })
      .distinct()
      .from<IGene>({ a: this.genesTable })
      .leftJoin({ b: 'zcc_prism_genes' }, 'a.gene_id', 'b.gene_id');

    // add condition if query-ing genes from a specific table
    if (getSampleGenes) {
      query = query.modify(getSampleGenes, 'a.gene_id');
    }

    // add importance and sort
    query = query
      .where(function customWhereBuilder() {
        if (gene && gene.length) {
          this.where('a.gene', 'like', `%${gene}%`);
        }
        if (geneId) {
          this.where('a.gene_id', geneId);
        }
      })
      .modify(withPrismGeneListImportance, 'b.gene_lists')
      .orderByRaw(orderByQuery, gene ? [gene] : undefined)
      .offset(offset)
      .limit(limit);

    return query;
  }

  public async getGene(geneId: number): Promise<IExtendedGene> {
    return this.knex
      .select({
        geneId: 'a.gene_id',
        gene: 'a.gene',
        chromosome: 'a.chromosome',
        geneStart: 'a.gene_start',
        geneEnd: 'a.gene_end',
        chromosomeBand: 'a.chromosomeBand',

        entrezUID: 'a.entrezUID',
        fullname: 'a.fullname',
        alias: 'a.alias',
        summary: 'a.summary',
        expression: 'a.expression',

        // HG 38 Data
        chromosomeHg38: 'a.chromosome_hg38',
        startHg38: 'a.start_hg38',
        endHg38: 'a.end_hg38',
        chromosomeBandHg38: 'a.chromosomeBand_hg38',
        strandHg38: 'a.strand_hg38',

        prismclass: 'b.gene_lists',
      })
      .from<IExtendedGene>({ a: this.genesTable })
      .modify(withPrismGeneListImportance, 'b.gene_lists', 'importance')
      .leftJoin({ b: 'zcc_prism_genes' }, 'a.gene_id', 'b.gene_id')
      .where('a.gene_id', geneId)
      .first();
  }

  public async getGeneLists(
    { listId, listName }: IGetAllGeneListsQuery,
    page = 1,
    limit = 100,
  ): Promise<IGeneList[]> {
    let currentPage = page;
    if (page < 1) {
      currentPage = 1;
    }
    const offset = (currentPage - 1) * limit;

    const jsonifyGenes = (row: IGeneListRaw): IGeneList => {
      const geneList = {
        listId: row.listId,
        listName: row.listName,
        genes: typeof row.genes === 'string' ? JSON.parse(row.genes) : row.genes,
      };
      return geneList;
    };

    return this.knex
      .select({
        listId: 'a.list_id',
        listName: 'a.list_name',
        // returns an array of IGene objects as a string
        genes: this.knex.raw(`
          JSON_ARRAYAGG(
            JSON_OBJECT(
              "gene", c.gene, 
              "geneId", c.gene_id,  
              "chromosome", c.chromosome_hg38
            )
          )`),
      })
      .from<IGeneListRaw>({ a: this.geneListsTable })
      .innerJoin({ b: 'zcc_list_contains_gene' }, 'a.list_id', 'b.list_id')
      .innerJoin({ c: 'zcc_genes' }, 'b.gene_id', 'c.gene_id')
      .where(function customWhereBuilder() {
        if (listName && listName.length) {
          this.where('a.list_name', 'like', `%${listName}%`);
        }
        if (listId) {
          this.where('a.list_id', listId);
        }
      })
      .groupBy('a.list_id')
      .orderBy([
        {
          column: 'list_name',
          order: 'asc',
        },
      ])
      .offset(offset)
      .limit(limit)
      .then((data) => data.map((row) => jsonifyGenes(row)));
  }

  public async getGeneListNames(
    { listId, listName }: IGetAllGeneListsQuery,
    page = 1,
    limit: number,
  ): Promise<IGeneList[]> {
    let currentPage = page;
    if (page < 1) {
      currentPage = 1;
    }

    const query = this.knex
      .select({
        listId: 'a.list_id',
        listName: 'a.list_name',
      })
      .from<IGeneList>({ a: this.geneListsTable })
      .where(function customWhereBuilder() {
        if (listName && listName.length) {
          this.where('a.list_name', 'like', `%${listName}%`);
        }
        if (listId) {
          this.where('a.list_id', listId);
        }
      })
      .orderBy([
        {
          column: 'list_name',
          order: 'asc',
        },
      ]);

    if (limit) {
      const offset = (currentPage - 1) * limit;
      query
        .offset(offset)
        .limit(limit);
    }

    return query;
  }

  public async getValidGenes(
    geneNames: string[],
  ): Promise<IGene[]> {
    let validGenes = [];
    await this.knex.select({
      gene: 'gene',
      geneId: 'gene_id',
      chromosome: 'chromosome_hg38',
      geneStart: 'start_hg38',
      geneEnd: 'end_hg38',
      prismclass: 'gene_lists',
    })
      .from(this.genesTable)
      .whereIn('gene', geneNames)
      .orderBy([
        {
          column: 'chromosome',
          order: 'asc',
        },
        {
          column: 'geneStart',
          order: 'asc',
        },
        {
          column: 'geneEnd',
          order: 'asc',
        },
      ])
      .then((geneList: IGene[]) => {
        validGenes = geneList;
      });

    return validGenes;
  }

  public async getFilteredGenes(
    genes : string[],
  ): Promise<IFilteredGenes> {
    const validGenes = await this.getValidGenes(genes);
    const invalidGenes: IInvalidGene[] = [];
    genes.forEach((gene) => {
      const isGeneValid = validGenes.some(
        (validGene) => validGene.gene.toLowerCase() === gene.toLowerCase(),
      );
      if (!isGeneValid) {
        invalidGenes.push({
          gene: gene || '',
        });
      }
    });

    return { validGenes, invalidGenes };
  }

  public async addGeneList(
    { listName, genes }: AddGeneListBodyDTO,
    user: IUser,
  ): Promise<void> {
    return this.knex.transaction(async (tsx) => {
      // create the list record
      const listId: number = await this.knex(this.geneListsTable)
        .transacting(tsx)
        .insert({
          list_name: listName,
          created_by: user.id,
          created_at: this.knex.fn.now(),
        });
      // create list items
      await this.knex(this.geneListMapTable)
        .transacting(tsx)
        .insert(
          genes.map((gene) => ({
            gene_id: gene.geneId,
            list_id: listId,
          })),
        );
    });
  }

  // TODO: Consolidate with get all genes endpoint
  // during analysis set migration
  public async getGenesByIds(filters: IGetGenesByIdsQuery): Promise<IGene[]> {
    return this.knex
      .select({
        gene: 'a.gene',
        geneId: 'a.gene_id',
        chromosome: 'a.chromosome_hg38',
        geneStart: 'a.start_hg38',
        geneEnd: 'a.end_hg38',
        prismclass: 'a.gene_lists',
      })
      .from<IGene>({ a: this.genesTable })
      .where(function customWhereBuilder() {
        if (filters.geneIds && filters.geneIds.length) {
          this.whereIn('a.gene_id', filters.geneIds);
        }
      })
      .orderBy('gene', 'asc');
  }
}
