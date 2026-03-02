/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuidV4 } from 'uuid';
import {
  ICreateReportDrug,
  ICreateTherapyDrug,
  IDowngradeDrugVersionBody,
  IDrugFilters,
  IReportDrug,
  ITherapyDrug,
  IUpdateDrugBody,
  IUser,
} from '../../Models';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

@Injectable()
export class DrugClient {
  private reportDrugTable = 'zcc_clinical_report_drugs';

  private therapyDrugsTable = 'zcc_clinical_therapy_drugs';

  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  public async addReportDrug(
    clinicalVersionId: string,
    {
      reportType,
      externalDrugVersionId,
      pbsApproved,
      appropriateTrial,
    }: ICreateReportDrug,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;
    // Insert drug data into drug table
    const drugId = uuidV4();
    await db.insert({
      id: drugId,
      clinical_version_id: clinicalVersionId,
      report_type: reportType,
      external_drug_version_id: externalDrugVersionId,
      pbs_approved: pbsApproved,
      appropriate_clinical_trial: appropriateTrial,
    })
      .into(this.reportDrugTable)
      .onConflict(['clinical_version_id', 'report_type', 'external_drug_version_id'])
      .ignore();
    return drugId;
  }

  public async updateReportDrug(
    clinicalVersionId: string,
    id: string,
    body: IUpdateDrugBody,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db.update({
      appropriate_clinical_trial: body.appropriateTrial,
      pbs_approved: body.pbsApproved,
    })
      .from(this.reportDrugTable)
      .where('id', id)
      .andWhere('clinical_version_id', clinicalVersionId);
  }

  public async deleteReportDrug(
    clinicalVersionId: string,
    id: string,
  ): Promise<void> {
    await this.knex.delete()
      .from(this.reportDrugTable)
      .where('id', id)
      .andWhere('clinical_version_id', clinicalVersionId);
  }

  public async addTherapyDrugByTherapyId(
    therapyId: string,
    {
      externalDrugClassId,
      externalDrugVersionId,
    }: ICreateTherapyDrug,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<ITherapyDrug> {
    if (trx.isCompleted()) {
      throw new InternalServerErrorException('Transaction failed');
    }

    const therapyDrugId = uuidV4();

    // Insert drugId and therapyId into therapy_drug_table
    await trx(this.therapyDrugsTable).insert({
      id: therapyDrugId,
      therapy_id: therapyId,
      external_drug_class_id: externalDrugClassId,
      external_drug_version_id: externalDrugVersionId,
      created_at: this.knex.fn.now(),
      created_by: currentUser?.id,
    });

    return {
      id: therapyDrugId,
      externalDrugClassId,
      externalDrugVersionId,
    };
  }

  public async getTherapyDrugsByTherapyId(
    therapyId: string,
  ): Promise<ITherapyDrug[]> {
    return this.knex.select({
      id: 'id',
      externalDrugVersionId: 'therapyDrugs.external_drug_version_id',
      externalDrugClassId: 'therapyDrugs.external_drug_class_id',
    })
      .from({ therapyDrugs: this.therapyDrugsTable })
      .where('therapy_id', therapyId);
  }

  private selectReportDrugsBase(
    clinicalVersionId: string,
  ): Knex.QueryBuilder {
    return this.knex.select({
      id: 'drug.id',
      clinicalVersionId: 'drug.clinical_version_id',
      reportType: 'drug.report_type',
      externalDrugVersionId: 'drug.external_drug_version_id',
      pbsApproved: 'drug.pbs_approved',
      appropriateTrial: 'drug.appropriate_clinical_trial',
    })
      .from<IReportDrug>({ drug: this.reportDrugTable })
      .where('clinical_version_id', clinicalVersionId);
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: IDrugFilters,
  ): void {
    qb.where(function applyFilters() {
      if (filters.reportType !== undefined) {
        this.where('report_type', filters.reportType);
      }
    });
  }

  public async getReportDrugs(
    clinicalVersionId: string,
    filters: IDrugFilters,
  ): Promise<IReportDrug[]> {
    return this.selectReportDrugsBase(
      clinicalVersionId,
    )
      .modify(this.withFilters, filters);
  }

  public async downgradeClinicalDrugVersion(
    clinicalVersionId: string,
    {
      drugVersionId,
      newDrugVersionId,
    }: IDowngradeDrugVersionBody,
  ): Promise<void> {
    await this.knex
      .update({
        external_drug_version_id: newDrugVersionId,
      })
      .from(this.therapyDrugsTable)
      .where({
        external_drug_version_id: drugVersionId,
      });

    await this.knex
      .update({
        external_drug_version_id: newDrugVersionId,
      })
      .from(this.reportDrugTable)
      .where({
        clinical_version_id: clinicalVersionId,
        external_drug_version_id: drugVersionId,
      });
  }

  public async openKnexTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }
}
