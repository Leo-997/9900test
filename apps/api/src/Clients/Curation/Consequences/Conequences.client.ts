import { Inject, Injectable } from "@nestjs/common";
import { Knex } from "knex";
import { IGetConsequencesQuery, IImpactGroups } from "Models/Curation/Consequences/Consequences.model";
import { KNEX_CONNECTION } from "Modules/Knex/constants";




@Injectable()
export class ConsequencesClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getConsequences(
    { impact }: IGetConsequencesQuery
  ): Promise<IImpactGroups | string[]> {
    const consequences = {
      high: await this.knex.select('consequence').from('zcc_consequence').where('impact', 'high').pluck('consequence'),
      medium: await this.knex.select('consequence').from('zcc_consequence').where('impact', 'medium').pluck('consequence'),
      low: await this.knex.select('consequence').from('zcc_consequence').where('impact', 'low').pluck('consequence'),
    }

    if (impact) return consequences[impact];

    return consequences;
  }
}