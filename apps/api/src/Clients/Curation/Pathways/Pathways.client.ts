import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IGetRnaPathwaysQuery } from 'Models/Curation/Pathways/Requests/GetRnaPathwaysQuery.model';
import { IRnaPathway } from 'Models/Curation/Pathways/RnaPathways.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPagination } from 'Utilities/query/misc.util';

@Injectable()
export class PathwaysCurationClient {
  private rnaPathwaysTable = 'zcc_rna_pathways';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public getRnaPathways(
    biosampleId: string,
    { search }: IGetRnaPathwaysQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<IRnaPathway[]> {
    return this.knex
      .select({
        biosampleId: 'a.biosample_id',
        pathwayId: 'a.pathway_id',
        name: 'b.pathway_name',
        pSize: 'a.psize',
        nde: 'a.nde',
        pNde: 'a.pnde',
        ta: 'a.ta',
        ppert: 'a.ppert',
        pg: 'a.pg',
        pgfdr: 'a.pgfdr',
        pgfwer: 'a.pgfwer',
        status: 'a.status',
        kegglink: 'a.kegglink',
      })
      .from<IRnaPathway>({ a: this.rnaPathwaysTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_pathways' }, 'a.pathway_id', 'b.pathway_id')
      .where('a.biosample_id', biosampleId)
      .andWhere(function customWhereBuilder() {
        if (search && search.length) {
          this.where('b.pathway_name', 'like', `%${search}%`);
        }
      })
      .orderBy('a.pg')
      .modify(withPagination, page, limit);
  }

  public async getRnaPathwaysCount(
    biosampleId: string,
    { search }: IGetRnaPathwaysQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.knex
      .count<Record<string, number>>('* as count')
      .from<IRnaPathway>({ a: this.rnaPathwaysTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_pathways' }, 'a.pathway_id', 'b.pathway_id')
      .where('a.biosample_id', biosampleId)
      .andWhere(function customWhereBuilder() {
        if (search && search.length) {
          this.where('b.pathway_name', 'like', `%${search}%`);
        }
      })
      .first();

    return data.count;
  }
}
