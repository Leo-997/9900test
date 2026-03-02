import { Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { PatientsService } from 'Services/Patients.service';

@Injectable()
export class AccessControlService {
  constructor(
    private readonly patientsService: PatientsService,
  ) {}

  async canAccessResource(
    isWriteEndoint: boolean,
    user: IUserWithMetadata,
    params: Record<string, string | string[]>,
    requireFullSampleAccess = false,
  ): Promise<boolean> {
    if (
      !(params.patientId)
      && !(params.analysisSetId)
      && !(params.biosampleId)
    ) {
      return true;
    }

    try {
      const patients = await this.patientsService.getAccessiblePatients(
        user,
        {
          analysisSetId: params.analysisSetId instanceof Array
            ? params.analysisSetId[0]
            : params.analysisSetId,
          patientId: params.patientId instanceof Array
            ? params.patientId[0]
            : params.patientId,
          biosampleId: params.biosampleId instanceof Array
            ? params.biosampleId[0]
            : params.biosampleId,
        },
      );

      const hasPatientAccess = !(params.patientId)
        || patients.some((p) => (
          p.patientId === params.patientId
          && (!isWriteEndoint || !p.isReadOnly)
          && (!requireFullSampleAccess || p.isFullCaseAccess)
        ));

      const hasASetAccess = !(params.analysisSetId)
        || patients.some((p) => (
          p.analysisSetId === params.analysisSetId
          && (!isWriteEndoint || !p.isReadOnly)
          && (!requireFullSampleAccess || p.isFullCaseAccess)
        ));

      const hasBiosampleAccess = !(params.biosampleId)
        || patients.some((p) => (
          p.biosampleId === params.biosampleId
          && (!isWriteEndoint || !p.isReadOnly)
        ));

      return hasPatientAccess && hasASetAccess && hasBiosampleAccess;
    } catch {
      return false;
    }
  }
}
