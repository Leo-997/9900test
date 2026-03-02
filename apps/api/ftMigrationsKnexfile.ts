import { knexConnectionConfigFileTracker } from './knexfile';
import { normalizeString } from './src/Config/configuration';

const migrationsConfig = {
  ...knexConnectionConfigFileTracker,
  connection: {
    ...knexConnectionConfigFileTracker.connection,
    user: process.env.DB_MIGRATION_USER
      ? normalizeString(process.env.DB_MIGRATION_USER)
      : knexConnectionConfigFileTracker.connection.user,
    password: process.env.DB_MIGRATION_PASSWORD
      ? normalizeString(process.env.DB_MIGRATION_PASSWORD)
      : knexConnectionConfigFileTracker.connection.password,
  },
};

export default migrationsConfig;
