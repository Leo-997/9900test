import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  IAccessiblePatient,
} from 'Models/AccessControl/AccessControl.model';
import { IAuthenticatedRequest } from 'Models/Auth/AuthenticatedRequest.model';
import { AccessControlService } from 'Services/index';

@Injectable()
export class AccessControlGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IAuthenticatedRequest = context.switchToHttp().getRequest();
    const patientId = this.resolvePatientId(request);

    if (!patientId) {
      return true;
    }

    const accessiblePatients = await AccessControlService.getAccessiblePatients(
      patientId,
      request.headers.authorization,
    );

    return this.hasAccess(accessiblePatients, patientId);
  }

  private resolvePatientId(request: IAuthenticatedRequest): string | null {
    const { params = {}, body = {}, query = {} } = request;

    return (
      body.patientId
      || query.patientId
      || params.patientId
    );
  }

  private hasAccess(
    accessiblePatients: IAccessiblePatient[],
    patientId: string,
  ): boolean {
    return accessiblePatients.some((patient) => {
      const matchesPatient = patient.patientId === patientId;
      const hasFullAccess = Boolean(patient.isFullCaseAccess);

      return matchesPatient && hasFullAccess;
    });
  }
}
