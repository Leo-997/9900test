import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IAccessControl, IAccessiblePatient, IAccessiblePatientQuery } from 'Models/AccessControl/AccessControl.model';

import { IPatient, IUpdatePatientBody } from 'Models/Patient/Patient.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withPatient } from 'Utilities/query/accessControl/withPatient.util';

@Injectable()
export class PatientsClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getPatientById(
    patientId: string,
    user: IUserWithMetadata,
  ): Promise<IPatient> {
    const patient = await this.knex
      .select({
        patientId: 'patient.patient_id',
        zccSubjectId: 'patient.zcc_subject_id',
        internalId: 'patient.internal_id',
        labmatrixId: 'patient.lm_subj_id',
        labmatrixCode: 'patient.lm_subj_code',
        sex: 'patient.sex',
        germlineAberration: 'patient.germline_aberration',
        ageAtDiagnosis: 'patient.age_at_diagnosis',
        ageAtDeath: 'patient.age_at_death',
        ageAtEnrolment: 'patient.age_at_enrolment',
        vitalStatus: 'patient.vital_status',
        hospital: 'patient.hospital',
        enrolmentDate: 'patient.enrolment_date',
        registrationDate: 'patient.registration_date',
        clinicalHistory: 'patient.clinical_history',
        stage: 'patient.stage',
        status: 'patient.status',
        comments: 'patient.comments',
        consanguinityScore: 'patient.consanguinity',
      })
      .modify(withPatient, 'from', user)
      .where('patient.patient_id', patientId)
      .first();

    return patient;
  }

  public async updatePatientById(
    patientId: string,
    body: IUpdatePatientBody,
  ): Promise<void> {
    await this.knex
      .update({
        clinical_history: body.clinicalHistory,
        comments: body.comments,
      })
      .from({ patient: 'zcc_patient' })
      .where('patient.patient_id', patientId);
  }

  public async getAccessiblePatients(
    user: IUserWithMetadata,
    filters: IAccessiblePatientQuery,
  ): Promise<IAccessiblePatient[]> {
    if (user.accessControls.length === 0) return [];

    const baseQuery = this.knex
      .select({
        study: 'patient.study',
        site: 'patient.hospital',
        patientId: 'patient.patient_id',
        analysisSetId: 'analysis.analysis_set_id',
        biosampleId: 'xref.biosample_id',
      })
      .from({ patient: 'zcc_patient' })
      .leftJoin(
        { analysis: 'zcc_analysis_set' },
        function joinAnalysisSet() {
          this.on(
            'patient.patient_id',
            'analysis.patient_id',
          )
            .andOn(
              'patient.study',
              'analysis.study',
            );
        },
      )
      .leftJoin(
        { xref: 'zcc_analysis_set_biosample_xref' },
        'xref.analysis_set_id',
        'analysis.analysis_set_id',
      );

    const biosampleReadonly = user.accessControls.filter(
      (ac) => Boolean(ac.biosampleId) && ac.isReadonly,
    );
    const biosampleReadWrite = user.accessControls.filter(
      (ac) => Boolean(ac.biosampleId) && !ac.isReadonly,
    );
    const fullcaseReadonly = user.accessControls.filter(
      (ac) => !ac.biosampleId && ac.isReadonly,
    );
    const fullcaseReadWrite = user.accessControls.filter(
      (ac) => !ac.biosampleId && !ac.isReadonly,
    );

    const queries: Knex.QueryBuilder[] = [];
    if (biosampleReadonly.length) {
      queries.push(
        baseQuery
          .clone()
          .select({
            isFullCaseAccess: this.knex.raw('false'),
            isReadOnly: this.knex.raw('true'),
          })
          .modify(
            this.withAccessControlFilters,
            biosampleReadonly,
            filters,
          ),
      );
    }

    if (biosampleReadWrite.length) {
      queries.push(
        baseQuery
          .clone()
          .select({
            isFullCaseAccess: this.knex.raw('false'),
            isReadOnly: this.knex.raw('false'),
          })
          .modify(
            this.withAccessControlFilters,
            biosampleReadWrite,
            filters,
          ),
      );
    }

    if (fullcaseReadonly.length) {
      queries.push(
        baseQuery
          .clone()
          .select({
            isFullCaseAccess: this.knex.raw('true'),
            isReadOnly: this.knex.raw('true'),
          })
          .modify(
            this.withAccessControlFilters,
            fullcaseReadonly,
            filters,
          ),
      );
    }

    if (fullcaseReadWrite.length) {
      queries.push(
        baseQuery
          .clone()
          .select({
            isFullCaseAccess: this.knex.raw('true'),
            isReadOnly: this.knex.raw('false'),
          })
          .modify(
            this.withAccessControlFilters,
            fullcaseReadWrite,
            filters,
          ),
      );
    }

    const result = (await Promise.all(queries)).flat();
    return result;
  }

  private withAccessControlFilters(
    qb: Knex.QueryBuilder,
    accessControls: IAccessControl[],
    filters: IAccessiblePatientQuery,
  ): void {
    qb
      .where(function applyAc() {
        for (const ac of accessControls) {
          this.orWhere(function accessControl() {
            if (ac.study) {
              this.andWhere('patient.study', ac.study.name);
            }
            if (ac.site) {
              this.andWhere('patient.hospital', ac.site.name);
            }
            if (ac.patientId) {
              this.andWhere('patient.patient_id', ac.patientId)
                .orWhere('patient.public_subject_id', ac.patientId);
            }
            if (ac.biosampleId) {
              this.andWhere('xref.biosample_id', ac.biosampleId);
            }
          });
        }
      })
      .andWhere(function applyFilters() {
        if (filters.patientId) {
          this.andWhere('patient.patient_id', filters.patientId)
            .orWhere('patient.patient_id', filters.patientId);
        }
        if (filters.analysisSetId) {
          this.andWhere('analysis.analysis_set_id', filters.analysisSetId);
        }
        if (filters.biosampleId) {
          this.andWhere('xref.biosample_id', filters.biosampleId);
        }
      });
  }
}
