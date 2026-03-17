import * as fs from 'fs';
import * as path from 'path';

import { Knex } from 'knex';
import { normalizeString } from './src/Config/configuration';

import { dbConfigSchema } from './dbconfig.schema';

interface IMySQL2Config extends Omit<Knex.Config, 'connection'> {
  connection?: Knex.MySql2ConnectionConfig;
}

function getDefaultConnectionConfiguration(): Knex.MySql2ConnectionConfig {
  const config: Knex.MySql2ConnectionConfig = {
    database: normalizeString(process.env.DB_NAME_API),
    host: normalizeString(process.env.DB_HOST),
    password: normalizeString(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT, 10),
    user: normalizeString(process.env.DB_USERNAME),
    ...(process.env.DB_SSL_CA
    || process.env.DB_SSL_CERT
    || process.env.DB_SSL_KEY
      ? {
        ssl: {
          ...(process.env.DB_SSL_CA
            ? {
              ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA)).toString(),
            }
            : {}),
          ...(process.env.DB_SSL_CERT
            ? {
              cert: fs.readFileSync(
                path.resolve(__dirname, process.env.DB_SSL_CERT),
              ).toString(),
            }
            : {}),
          ...(process.env.DB_SSL_KEY
            ? {
              key: fs.readFileSync(
                path.resolve(__dirname, process.env.DB_SSL_KEY),
              ).toString(),
            }
            : {}),
        },
      }
      : {}),
  };
  return config;
}

function getConnectionConfigurationFileTracker(): Knex.MySql2ConnectionConfig {
  const config: Knex.MySql2ConnectionConfig = {
    database: normalizeString(process.env.DB_NAME_FILE_TRACKER),
    host: normalizeString(process.env.DB_HOST),
    password: normalizeString(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT, 10),
    user: normalizeString(process.env.DB_USERNAME),
    ...(process.env.DB_SSL_CA
    || process.env.DB_SSL_CERT
    || process.env.DB_SSL_KEY
      ? {
        ssl: {
          ...(process.env.DB_SSL_CA
            ? {
              ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA)).toString(),
            }
            : {}),
          ...(process.env.DB_
            ? {
              cert: fs.readFileSync(
                path.resolve(__dirname, process.env.DB_SSL_CERT),
              ).toString(),
            }
            : {}),
          ...(process.env.DB_SSL_KEY
            ? {
              key: fs.readFileSync(
                path.resolve(__dirname, process.env.DB_SSL_KEY),
              ).toString(),
            }
            : {}),
        },
      }
      : {}),
  };
  return config;
}

function getConnectionConfiguration(db?: string): IMySQL2Config {
  let config = getDefaultConnectionConfiguration();
  if (db === 'filetracker') {
    config = getConnectionConfigurationFileTracker();
  }

  const { error, value } = dbConfigSchema.validate(config);
  if (error) {
    console.error(error);
    throw error;
  }

  return {
    connection: {
      database: value.database,
      host: value.host,
      password: value.password,
      port: value.port,
      user: value.user,
      ssl: value.ssl,
      typeCast: (field, next) => {
        if (field.type === 'TINY' && field.length === 1) {
          const content = field.string();
          return content === null ? content : content === '1'; // 1 = true, 0 = false
        }
        return next();
      },
    },
  };
}

function knexConfig(db?: string): IMySQL2Config {
  const connectionConfig = getConnectionConfiguration(db);
  return {
    client: 'mysql2',
    ...connectionConfig,
    pool: {
      min: Math.min(parseInt(process.env.DB_MAX_CONNECTIONS, 10), 10),
      max: parseInt(process.env.DB_MAX_CONNECTIONS, 10),
    },
    migrations: {
      directory: `database/migrations/${db}`,
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: 'database/seeds',
    },
  };
}

export const knexConnectionConfig = knexConfig('zerodash');
export const knexConnectionConfigFileTracker = knexConfig('filetracker');
export default knexConnectionConfig;
