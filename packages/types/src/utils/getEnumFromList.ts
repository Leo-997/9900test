export function getEnumFromList<T extends string>(
  arr: readonly T[],
): Record<string, T> {
  return arr.reduce(
    (acc, type) => ({ ...acc, [type.replace(/[^_a-zA-Z0-9]/g, '_')]: type }),
    {} as Record<(typeof arr)[number], (typeof arr)[number]>,
  );
}
