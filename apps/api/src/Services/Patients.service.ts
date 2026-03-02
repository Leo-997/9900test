import {
  BadRequestException, Inject, Injectable,
} from '@nestjs/common';

import { PatientsClient } from 'Clients/Patient.client';
import { IAccessiblePatient, IAccessiblePatientQuery } from 'Models/AccessControl/AccessControl.model';
import { IPatient, IUpdatePatientBody } from 'Models/Patient/Patient.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { CACHE_SERVICE } from 'Modules/Cache/Cache.module';
import { CacheService } from './Cache/Cache.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly patientsClient: PatientsClient,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
  ) {}

  public async getPatientById(
    patientId: string,
    user: IUserWithMetadata,
  ): Promise<IPatient> {
    return this.patientsClient.getPatientById(patientId, user);
  }

  public async updatePatientById(
    patientId: string,
    body: IUpdatePatientBody,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }

    return this.patientsClient.updatePatientById(patientId, body);
  }

  public async getAccessiblePatients(
    user: IUserWithMetadata,
    query: IAccessiblePatientQuery,
  ): Promise<IAccessiblePatient[]> {
    if (Object.values(query).every((v) => v === undefined)) {
      throw new BadRequestException('At least one filter must be set');
    }
    const cachePrefix = `${PatientsService.name}.${this.getAccessiblePatients.name}`;
    const cacheObj = {
      userId: user.id,
      analysisSetId: query.analysisSetId,
      patientId: query.patientId,
      biosampleId: query.biosampleId,
    };
    // Check cache first
    const cachedResult = await this.cacheService.getResults<IAccessiblePatient[]>(
      cachePrefix,
      cacheObj,
    );
    if (cachedResult) {
      return cachedResult;
    }
    const res = await this.patientsClient.getAccessiblePatients(user, query);
    await this.cacheService.setResults(
      cachePrefix,
      cacheObj,
      res,
    );
    return res;
  }
}
