export interface IDatabaseConnectionConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}
export interface IDatabaseConfig {
  connection: IDatabaseConnectionConfig;
}
export interface IConfig {
  database: IDatabaseConfig;
}

export function normalizeString<T extends string>(str: T): string | undefined {
  if (str === undefined) {
    return undefined;
  }
  const newStr = str.trim();

  return newStr;
}

export default (): IConfig => ({
  database: {
    connection: {
      host: normalizeString(process.env.DB_HOST),
      port: process.env.DB_PORT,
      user: normalizeString(process.env.DB_USER),
      password: normalizeString(process.env.DB_PASSWORD),
      database: normalizeString(process.env.DB_NAME_CAPTURE),
    },
  },
});
