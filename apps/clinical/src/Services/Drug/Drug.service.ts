import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { Knex } from 'knex';
import { ICommonResp } from 'Models/Common/Response.model';
import { normalizeString } from 'Utils/string.util';
import { DrugClient } from '../../Clients';
import {
  ICreateReportDrug,
  ICreateTherapyDrug,
  IDowngradeDrugVersionBody,
  IDrugFilters,
  IExternalDrug,
  IFetchTherapyDrug,
  IReportDrug,
  ITherapyDrug,
  IUpdateDrugBody,
  IUser,
} from '../../Models';

@Injectable()
export class DrugService {
  constructor(
    private readonly drugClient: DrugClient,
    private httpService: HttpService,
  ) {}

  public async addReportDrug(
    clinicalVersionId: string,
    createDrugBody: ICreateReportDrug,
  ): Promise<string> {
    return this.drugClient.addReportDrug(clinicalVersionId, createDrugBody);
  }

  public async updateReportDrug(
    clinicalVersionId: string,
    id: string,
    body: IUpdateDrugBody,
    trx?: Knex.Transaction,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('Must specify at least 1 property to update');
    }
    await this.drugClient.updateReportDrug(
      clinicalVersionId,
      id,
      body,
      trx,
    );
  }

  public async deleteReportDrug(
    clinicalVersionId: string,
    id: string,
  ): Promise<void> {
    await this.drugClient.deleteReportDrug(clinicalVersionId, id);
  }

  public async addTherapyDrugByTherapyId(
    therapyId: string,
    createDrugBody: ICreateTherapyDrug,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<ITherapyDrug> {
    return this.drugClient.addTherapyDrugByTherapyId(
      therapyId,
      createDrugBody,
      currentUser,
      trx,
    );
  }

  public async getDetailedReportDrugs(
    clinicalVersionId: string,
    filters: IDrugFilters,
    headers: IncomingHttpHeaders,
  ): Promise<IReportDrug[]> {
    const reportDrugs = await this.drugClient.getReportDrugs(clinicalVersionId, filters);
    return Promise.all(reportDrugs.map(async (reportDrug) => ({
      ...reportDrug,
      externalDrug: await this.getExternalDrugByVersionId(
        reportDrug.externalDrugVersionId,
        headers,
      ),
    })));
  }

  public async getTherapyDrugsByTherapyId(
    therapyId: string,
    headers: IncomingHttpHeaders,
  ): Promise<IFetchTherapyDrug[]> {
    const therapyDrugs = await this.drugClient.getTherapyDrugsByTherapyId(therapyId);
    return Promise.all(therapyDrugs.map(
      (therapyDrug) => this.hydrateTherapyDrug(therapyDrug, headers),
    ));
  }

  private async hydrateTherapyDrug(
    therapyDrug: ITherapyDrug,
    headers: IncomingHttpHeaders,
  ): Promise<IFetchTherapyDrug> {
    const externalDrug = await this.getExternalDrugByVersionId(
      therapyDrug.externalDrugVersionId,
      headers,
    );
    const externalDrugClass = await this.getExternalDrugClassById(
      therapyDrug.externalDrugClassId,
      headers,
    );

    return {
      id: therapyDrug.id,
      class: externalDrugClass,
      externalDrug,
    };
  }

  public async getExternalDrugByVersionId(
    externalDrugVersionId: string,
    headers: IncomingHttpHeaders,
  ): Promise<IExternalDrug> {
    if (externalDrugVersionId === null) return null;
    try {
      const drugBaseUrl = `${normalizeString(process.env.VITE_DRUGS_URL)}/drugs/version/${externalDrugVersionId}`;
      const drugResp = await this.httpService.axiosRef.get<IExternalDrug>(drugBaseUrl, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: headers.authorization,
        },
      });
      return drugResp.data;
    } catch {
      return {
        id: 'unknown',
        versionId: 'unknown',
        version: 0,
        latestVersion: 0,
        name: 'Unknown Drug',
        isValidated: false,
        pathways: [],
        targets: [],
        classes: [],
      };
    }
  }

  public async getExternalDrugClassById(
    externalDrugClassId: string,
    headers: IncomingHttpHeaders,
  ): Promise<ICommonResp> {
    try {
      const classBaseUrl = `${normalizeString(process.env.VITE_DRUGS_URL)}/drugs/class/${externalDrugClassId}`;
      const classResp = await this.httpService.axiosRef.get<ICommonResp>(classBaseUrl, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: headers.authorization,
        },
      });
      return classResp.data;
    } catch {
      return {
        id: 'unknown',
        name: 'Unknown Class',
      };
    }
  }

  public async downgradeClinicalDrugVersion(
    clinicalVersionId: string,
    body: IDowngradeDrugVersionBody,
  ): Promise<void> {
    await this.drugClient.downgradeClinicalDrugVersion(
      clinicalVersionId,
      body,
    );
  }
}
