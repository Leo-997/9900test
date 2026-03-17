import {
  ExecutionContext, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAuthenticatedRequest, IUserWithMetadata } from 'Models';
import { IS_WRITE_ENDPOINT_KEY } from 'Models/AccessControl/AccessControl.model';
import { IClinicalVersion } from 'Models/ClinicalVersion/ClinicalVersion.model';
import { SampleService } from '../Sample/Sample.service';

@Injectable()
export class AccessControlService {
  constructor(
    private readonly reflector: Reflector,
    private readonly sampleService: SampleService,
  ) {}

  async canAccessResource(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const isWriteEndpoint = this.reflector.get<boolean>(
      IS_WRITE_ENDPOINT_KEY,
      context.getHandler(),
    );

    const clinicalVersionId = this.extractClinicalVersionId(request);
    const analysisSetId = this.extractAnalysisSetId(request);

    if (!clinicalVersionId && !analysisSetId) {
      return true;
    }

    const fetchedClinicalVersion = await this.getClinicalVersion(
      request.user,
      { clinicalVersionId, analysisSetId },
      isWriteEndpoint,
    );

    return Boolean(fetchedClinicalVersion);
  }

  private extractClinicalVersionId(request: IAuthenticatedRequest): string | undefined {
    const { params = {}, body = {}, query = {} } = request;
    return (
      body.clinicalVersionId
      || query.clinicalVersionId
      || params.clinicalVersionId
    );
  }

  private extractAnalysisSetId(request: IAuthenticatedRequest): string | undefined {
    const { params = {}, body = {}, query = {} } = request;
    return (
      body.analysisSetId
      || query.analysisSetId
      || params.analysisSetId
    );
  }

  private async getClinicalVersion(
    user: IUserWithMetadata,
    query: {
      clinicalVersionId?: string,
      analysisSetId?: string,
    },
    isWriteEndpoint: boolean,
  ): Promise<IClinicalVersion | null> {
    const clinicalVersion = await this.sampleService.getClinicalVersion(
      user,
      query.clinicalVersionId,
      query.analysisSetId,
      isWriteEndpoint,
    );
    return clinicalVersion ?? null;
  }
}
