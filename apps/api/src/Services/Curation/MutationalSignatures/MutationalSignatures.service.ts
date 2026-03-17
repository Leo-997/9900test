import { BadRequestException, Injectable } from '@nestjs/common';
import { MutationalSignaturesClient } from 'Clients/Curation/MutationalSignatures/MutationalSignatures.client';
import { NotFoundError } from 'Errors/NotFound.error';
import { GetReportableVariantDTO } from 'Models/Common/Requests/GetReportableVariant.model';
import {
  ISignatureData,
} from 'Models/Curation/MutationalSignatures/MutationalSignatures.model';
import { IUpdateSignature } from 'Models/Curation/MutationalSignatures/Requests/UpdateSignatureBodyDTO.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class MutationalSignaturesService {
  constructor(
    private readonly mutationalSignaturesClient: MutationalSignaturesClient,
  ) {}

  public async getSigData(
    biosampleId: string,
    filters: GetReportableVariantDTO,
    user: IUserWithMetadata,
  ): Promise<ISignatureData[]> {
    const data = this.mutationalSignaturesClient.getSigData(biosampleId, filters, user);

    if (!data) {
      throw new NotFoundError(
        `Not Found: any Mutational Signature data for ${biosampleId}`,
      );
    }

    return data;
  }

  public async getSigById(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ISignatureData> {
    const data = this.mutationalSignaturesClient.getSigById(biosampleId, variantId, user);

    if (!data) {
      throw new NotFoundError(
        `Not Found: any Mutational Signature data for ${biosampleId}`,
      );
    }

    return data;
  }

  public async updateSigs(
    biosampleId: string,
    sig: string,
    fieldsToUpdate: IUpdateSignature,
  ): Promise<number> {
    if (Object.values(fieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined.');
    }
    const numRowsUpdated = this.mutationalSignaturesClient.updateSigs(
      biosampleId,
      sig,
      fieldsToUpdate,
    );

    if (numRowsUpdated) return numRowsUpdated;

    throw new NotFoundError('Could not find Mutational Signature to update');
  }
}
