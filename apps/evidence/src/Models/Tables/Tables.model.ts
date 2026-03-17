import { Knex } from 'knex';
import { ICitation } from '../Citation/Citation.model';
import { IEvidence } from '../Evidence/Evidence.model';
import { IResource } from '../Resource/Resource.model';
import { IUser } from '../User/User.model';

declare module 'knex/types/tables' {
  interface Tables {
    zcc_evidences: Knex.CompositeTableType<
      IEvidence,
      Partial<IEvidence>
    >;
    zcc_citations: Knex.CompositeTableType<
      ICitation,
      Partial<ICitation>
    >;
    zcc_resources: Knex.CompositeTableType<
      IResource,
      Partial<IResource>
    >;
    zcc_users: Knex.CompositeTableType<
      IUser
    >;
  }
}
