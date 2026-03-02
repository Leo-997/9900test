import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';

export function withAnalysisSet(
  qb: Knex.QueryBuilder,
  type: 'from' | 'innerJoin' | 'leftJoin',
  user: IUserWithMetadata,
  analysisSetJoinCol: string = undefined,
  studyJoinCol: string = undefined,
  withFullAccess = false,
): void {
  if (['innerJoin', 'leftJoin'].includes(type) && !analysisSetJoinCol) {
    throw new Error('Missing analysisSetJoinCol argument');
  }

  if (type === 'from') {
    qb[type]({ analysis: `${process.env.DB_NAME_API}.zcc_analysis_set` });
  } else if (studyJoinCol) {
    // join on study and patient id
    qb[type]({ analysis: `${process.env.DB_NAME_API}.zcc_analysis_set` }, function joins() {
      this.on('analysis.analysis_set_id', analysisSetJoinCol)
        .andOn('analysis.study', studyJoinCol);
    });
  } else {
    qb[type]({ analysis: `${process.env.DB_NAME_API}.zcc_analysis_set` }, 'analysis.analysis_set_id', analysisSetJoinCol);
  }

  const accessControls = withFullAccess
    ? user.accessControls.filter((ac) => !ac.biosampleId)
    : user.accessControls;

  if (!accessControls.length) {
    qb.whereIn('analysis.analysis_set_id', ['']);
    return;
  }

  qb
    .innerJoin({ analysisACPatient: `${process.env.DB_NAME_API}.zcc_patient` }, function joins() {
      this.on('analysis.patient_id', 'analysisACPatient.patient_id')
        .andOn('analysis.study', 'analysisACPatient.study');
    })
    .where(function applyAccessControls() {
      for (const ac of accessControls) {
        this.orWhere(function accessControl() {
          if (ac.study) {
            this.andWhere('analysisACPatient.study', ac.study.name);
          }
          if (ac.site) {
            this.andWhere('analysisACPatient.hospital', ac.site.name);
          }
          if (ac.patientId) {
            this.andWhere('analysisACPatient.public_subject_id', ac.patientId);
          }
        });
      }
    });
}
