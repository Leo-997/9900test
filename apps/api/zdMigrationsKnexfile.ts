import { knexConnectionConfig } from './knexfile';
import { normalizeString } from './src/Config/configuration';

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
