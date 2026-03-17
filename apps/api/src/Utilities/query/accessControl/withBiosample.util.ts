import { Knex } from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';

export function withBiosample(
  qb: Knex.QueryBuilder,
  type: 'from' | 'innerJoin',
  user: IUserWithMetadata,
  joinCol: string = undefined,
  skipAccessControl = false,
): void {
  if (type === 'innerJoin' && !joinCol) {
    throw new Error('Missing joinCol argument');
  }

  if (type === 'from') {
    qb[type]({ biosample: `${process.env.DB_NAME_API}.zcc_biosample` });
  } else {
    qb[type]({ biosample: `${process.env.DB_NAME_API}.zcc_biosample` }, 'biosample.biosample_id', joinCol);
  }

  if (skipAccessControl) {
    return;
  }

  if (!user.accessControls?.length) {
    qb.whereIn('biosample.biosample_id', ['']);
    return;
  }

  qb
    .innerJoin({ biosampleACPatient: `${process.env.DB_NAME_API}.zcc_patient` }, 'biosampleACPatient.patient_id', 'biosample.patient_id')
    .where(function applyAccessControls() {
      for (const ac of user.accessControls) {
        this.orWhere(function accessControl() {
          if (ac.study) {
            this.andWhere('biosampleACPatient.study', ac.study.name);
          }
          if (ac.site) {
            this.andWhere('biosampleACPatient.hospital', ac.site.name);
          }
          if (ac.patientId) {
            this.andWhere('biosampleACPatient.public_subject_id', ac.patientId);
          }
          if (ac.biosampleId) {
            this.andWhere('biosample.biosample_id', ac.biosampleId);
          }
        });
      }
    });
}
