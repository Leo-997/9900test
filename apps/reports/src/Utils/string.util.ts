
export function normalizeString<T extends string>(str: T): string | undefined {
  if (str === undefined) {
    return undefined;
  }
  const newStr = str.trim();

  return newStr;
}
