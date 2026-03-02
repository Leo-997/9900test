import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';

export function withPatient(
  qb: Knex.QueryBuilder,
  type: 'from' | 'innerJoin',
  user: IUserWithMetadata,
  patientIdJoinCol: string = undefined,
  studyJoinCol: string = undefined,
): void {
  if (type === 'innerJoin' && !patientIdJoinCol) {
    throw new Error('Missing patientIdJoinCol argument');
  }

  if (type === 'from') {
    qb[type]({ patient: 'zcc_patient' });
  } else if (studyJoinCol) {
    // join on study and patient id
    qb[type]({ patient: 'zcc_patient' }, function joins() {
      this.on('patient.patient_id', patientIdJoinCol)
        .andOn('patient.study', studyJoinCol);
    });
  } else {
    qb[type]({ patient: 'zcc_patient' }, 'patient.patient_id', patientIdJoinCol);
  }

  if (!user.accessControls?.length) {
    qb.whereIn('patient.patient_id', ['']);
    return;
  }

  qb.where(function applyAccessControls() {
    for (const ac of user.accessControls) {
      this.orWhere(function accessControl() {
        if (ac.study) {
          this.andWhere('patient.study', ac.study.name);
        }
        if (ac.site) {
          this.andWhere('patient.hospital', ac.site.name);
        }
        if (ac.patientId) {
          this.andWhere('patient.public_subject_id', ac.patientId);
        }
      });
    }
  });
}
