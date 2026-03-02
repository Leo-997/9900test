export function toFixedNoRounding(num: number | null, precision: number): string | undefined {
  if (num === null || num === undefined) {
    return undefined;
  }

  const withDP = num.toFixed(precision + 2); // add a bunch of DP at the end, even for integer
  const regExp = new RegExp(`^-?\\d+(?:.\\d{0,${precision}})?`);
  const matches = withDP.toString().match(regExp);
  return matches
    ? matches[0]
    : undefined;
}
