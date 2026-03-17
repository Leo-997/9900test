import { Inject, Injectable } from "@nestjs/common";
import { ConsequencesClient } from "Clients/Curation/Consequences/Conequences.client";
import { IGetConsequencesQuery, IImpactGroups } from "Models/Curation/Consequences/Consequences.model";

@Injectable()
export class ConsequencesService {
  constructor(
    @Inject(ConsequencesClient) private readonly consequencesClient: ConsequencesClient
  ) {}

  public async getConsequences(
    filters: IGetConsequencesQuery
  ): Promise<IImpactGroups | string[]> {
    return this.consequencesClient.getConsequences(filters);
  }
}