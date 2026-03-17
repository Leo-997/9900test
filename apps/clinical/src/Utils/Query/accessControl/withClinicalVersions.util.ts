import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/index';

export type JoinType = 'from' | 'innerJoin';

export function withClinicalVersion(
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
    qb[type]({ version: 'zcc_clinical_versions' });
  } else {
    qb[type]({ version: 'zcc_clinical_versions' }, 'version.id', joinCol);
  }

  const accessControls = user.accessControls.filter((ac) => (
    !ac.biosampleId && (!ac.isReadonly || !checkWrite)
  ));

  if (!accessControls.length) {
    qb.whereIn('version.analysis_set_id', ['']);
    return;
  }

  qb
    .innerJoin({ versionAnalysis: `${process.env.DB_NAME_API}.zcc_analysis_set` }, 'versionAnalysis.analysis_set_id', 'version.analysis_set_id')
    .innerJoin({ versionPatient: `${process.env.DB_NAME_API}.zcc_patient` }, function joins() {
      this.on('versionAnalysis.patient_id', 'versionPatient.patient_id')
        .andOn('versionAnalysis.study', 'versionPatient.study');
    })
    .where(function applyAccessControls() {
      for (const ac of accessControls) {
        this.orWhere(function accessControl() {
          if (ac.study) {
            this.andWhere('versionPatient.study', ac.study.name);
          }
          if (ac.site) {
            this.andWhere('versionPatient.hospital', ac.site.name);
          }
          if (ac.patientId) {
            this.andWhere('versionPatient.public_subject_id', ac.patientId);
          }
        });
      }
    });
}
