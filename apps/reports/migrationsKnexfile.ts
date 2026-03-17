import { Knex } from 'knex';
import { knexConnectionConfig } from './knexfile';
import { normalizeString } from './src/Utils/string.util';

const migrationsConfig = {
  ...knexConnectionConfig,
  connection: {
    ...(knexConnectionConfig.connection as Knex.MySql2ConnectionConfig),
    user: process.env.DB_MIGRATION_USER
      ? normalizeString(process.env.DB_MIGRATION_USER)
      : (knexConnectionConfig.connection as Knex.MySql2ConnectionConfig).user,
    password: process.env.DB_MIGRATION_PASSWORD
      ? normalizeString(process.env.DB_MIGRATION_PASSWORD)
      : (knexConnectionConfig.connection as Knex.MySql2ConnectionConfig).password,
  },
};

export default migrationsConfig;
