import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosHeaderValue } from 'axios';
import type { IAccessiblePatient } from 'Models/AccessControl/AccessControl.model';
import { normalizeString } from 'Utils/string.util';

@Injectable()
export class AccessControlService {
  static async getAccessiblePatients(
    patientId: string,
    authorization?: AxiosHeaderValue,
  ): Promise<IAccessiblePatient[]> {
    const logger = new Logger(AccessControlService.name);
    const zeroDashApiBase = normalizeString(process.env.VITE_BASE_URL);
    const httpService = new HttpService();

    if (!zeroDashApiBase) {
      logger.warn('VITE_BASE_URL not configured; returning empty accessible patients');
      return [];
    }

    try {
      const resp = await httpService.axiosRef.get<IAccessiblePatient[]>(
        `${zeroDashApiBase}/patients/accessible`,
        {
          params: {
            patientId,
          },
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: authorization,
          },
        },
      );
      const accessiblePatients = resp.data || [];
      return accessiblePatients;
    } catch (error) {
      logger.error('Failed to fetch accessible patients from Zero Dash API', error);
      return [];
    }
  }
}
