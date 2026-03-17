import { normalizeString } from 'Config/configuration';
import { knexConnectionConfig } from './knexfile';

const migrationsConfig = {
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection,
    user: process.env.DB_MIGRATION_USER
      ? normalizeString(process.env.DB_MIGRATION_USER)
      : knexConnectionConfig.connection.user,
    password: process.env.DB_MIGRATION_PASSWORD
      ? normalizeString(process.env.DB_MIGRATION_PASSWORD)
      : knexConnectionConfig.connection.password,
  },
};

export default migrationsConfig;
