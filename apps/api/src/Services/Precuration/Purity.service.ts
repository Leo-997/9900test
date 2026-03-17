import { Inject, Injectable } from '@nestjs/common';
import { PurityClient } from 'Clients/Precuration/Purity.client';
import { IPurityFilters } from 'Models/Precuration/Purity.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class PurityService {
  constructor(
    @Inject(PurityClient) private readonly purityClient: PurityClient,
  ) {}

  public getPurity(filters: IPurityFilters, user: IUserWithMetadata): Promise<any> {
    return this.purityClient.getPurity(filters, user);
  }

  public getPurityById(id: string, user: IUserWithMetadata): Promise<any> {
    return this.purityClient.getPurityById(id, user);
  }
}
