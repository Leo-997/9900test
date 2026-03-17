import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/User/User.model';

export type JoinType = 'from' | 'innerJoin';

export function withReports(
  qb: Knex.QueryBuilder,
  type: JoinType,
  user: IUserWithMetadata,
  joinCol?: string,
  checkWrite = false,
): void {
  if (['innerJoin'].includes(type) && !joinCol) {
    throw new Error('Missing joinCol argument');
  }

  if (type === 'from') {
    qb[type]({ reports: 'zcc_reports' });
  } else {
    qb[type]({ reports: 'zcc_reports' }, 'reports.id', joinCol);
  }

  const accessControls = user.accessControls.filter((ac) => (
    !ac.biosampleId && (!ac.isReadonly || !checkWrite)
  ));

  if (!accessControls.length) {
    qb.whereIn('reports.analysis_set_id', ['']);
    return;
  }

  qb
    .innerJoin({ reportAnalysis: `${process.env.DB_NAME_API}.zcc_analysis_set` }, 'reportAnalysis.analysis_set_id', 'reports.analysis_set_id')
    .innerJoin({ reportPatient: `${process.env.DB_NAME_API}.zcc_patient` }, function joins() {
      this.on('reportAnalysis.patient_id', 'reportPatient.patient_id')
        .andOn('reportAnalysis.study', 'reportPatient.study');
    })
    .where(function applyAccessControls() {
      for (const ac of accessControls) {
        this.orWhere(function accessControl() {
          if (ac.study) {
            this.andWhere('reportPatient.study', ac.study.name);
          }
          if (ac.site) {
            this.andWhere('reportPatient.hospital', ac.site.name);
          }
          if (ac.patientId) {
            this.andWhere('reportPatient.public_subject_id', ac.patientId);
          }
        });
      }
    });
}
