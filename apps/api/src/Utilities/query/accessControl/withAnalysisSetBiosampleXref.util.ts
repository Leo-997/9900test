import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';

export function withAnalysisSetBiosampleXref(
  qb: Knex.QueryBuilder,
  type: 'from' | 'innerJoin',
  user: IUserWithMetadata,
  joinCols: [string, string] = undefined,
  skipAccessControl = false,
): void {
  if (type === 'innerJoin' && !joinCols) {
    throw new Error('Missing joinCols argument');
  }

  if (type === 'from') {
    qb[type]({ xref: 'zcc_analysis_set_biosample_xref' });
  } else {
    qb[type]({ xref: 'zcc_analysis_set_biosample_xref' }, joinCols[0], joinCols[1]);
  }

  if (skipAccessControl) {
    return;
  }

  if (!user.accessControls?.length) {
    qb.whereIn('xref.analysis_set_id', ['']);
    return;
  }

  qb
    .innerJoin({ xrefACAnalysis: `${process.env.DB_NAME_API}.zcc_analysis_set` }, 'xrefACAnalysis.analysis_set_id', 'xref.analysis_set_id')
    .innerJoin({ xrefACPatient: `${process.env.DB_NAME_API}.zcc_patient` }, function joins() {
      this.on('xrefACAnalysis.patient_id', 'xrefACPatient.patient_id')
        .andOn('xrefACAnalysis.study', 'xrefACPatient.study');
    })
    .where(function applyAccessControls() {
      for (const ac of user.accessControls) {
        this.orWhere(function accessControl() {
          if (ac.study) {
            this.andWhere('xrefACPatient.study', ac.study.name);
          }
          if (ac.site) {
            this.andWhere('xrefACPatient.hospital', ac.site.name);
          }
          if (ac.patientId) {
            this.andWhere('xrefACPatient.public_subject_id', ac.patientId);
          }
        });
      }
    });
}
