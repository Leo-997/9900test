export function normalizeString<T extends string>(str: T): string | undefined {
  if (!str) {
    return undefined;
  }
  const newStr = str.trim().replaceAll('’', '\'');

  return newStr;
}
