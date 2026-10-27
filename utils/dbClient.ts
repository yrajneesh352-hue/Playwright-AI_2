import "dotenv/config";
import {
  createPool,
  type Pool,
  type QueryResult,
  type RowDataPacket,
} from "mysql2/promise";
import { getRequiredEnv } from "./helper";

type QueryValue = string | number | bigint | boolean | Date | Buffer | null;

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const portValue = process.env.DB_PORT ?? "3306";
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RangeError(`DB_PORT must be a valid TCP port; received "${portValue}".`);
  }

  pool = createPool({
    host: getRequiredEnv("DB_HOST"),
    user: getRequiredEnv("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: getRequiredEnv("DB_NAME"),
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export async function query<T extends QueryResult = RowDataPacket[]>(
  sql: string,
  values: QueryValue[] = [],
): Promise<T> {
  const [result] = await getPool().query<T>(sql, values);
  return result;
}

export async function closeDbConnection(): Promise<void> {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = undefined;
  await activePool.end();
}
