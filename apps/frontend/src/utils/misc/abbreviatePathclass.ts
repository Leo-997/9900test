export function abbreviatePathclass(pathClass?: string | null): string | undefined {
  if (!pathClass) {
    return undefined;
  }

  if (pathClass.toLowerCase() === 'false positive') {
    return 'FP';
  }

  if (pathClass.toLowerCase() === 'unclassified') {
    return 'U';
  }

  if (pathClass.toLowerCase() === 'gus') {
    return 'G';
  }

  const short = /^(C[^:]+):/.exec(pathClass);

  if (short !== null && short[1] !== null) {
    return short[1];
  }

  return undefined;
}
