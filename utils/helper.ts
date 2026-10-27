import { DateTime } from "luxon";

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Required environment variable "${name}" is not set.`);
  }
  return value;
}

export function formatDate(
  value: Date | string | DateTime = DateTime.now(),
  format = "yyyy-LL-dd HH:mm:ss",
): string {
  let dateTime: DateTime;
  if (DateTime.isDateTime(value)) {
    dateTime = value;
  } else if (value instanceof Date) {
    dateTime = DateTime.fromJSDate(value);
  } else {
    dateTime = DateTime.fromISO(value);
  }

  if (!dateTime.isValid) {
    throw new RangeError(`Cannot format invalid date: "${String(value)}".`);
  }

  return dateTime.toFormat(format);
}
