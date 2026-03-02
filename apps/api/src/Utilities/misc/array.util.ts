function findDiffBetweenArrays<T, U>(
  referenceArray: T[],
  comparisonArr: U[],
  comparisonCb: (a: T, b: U) => boolean,
): { toAdd: T[]; toRemove: U[] } {
  const toAdd = referenceArray.reduce((acc, a) => {
    if (!comparisonArr.some((b) => comparisonCb(a, b))) {
      acc.push(a);
    }
    return acc;
  }, [] as T[]);

  const toRemove = comparisonArr.reduce((acc, b) => {
    if (!referenceArray.some((a) => comparisonCb(a, b))) {
      acc.push(b);
    }

    return acc;
  }, [] as U[]);

  return {
    toAdd,
    toRemove,
  };
}

const t = ['a'];
const b = [
  {
    key: 'a',
  },
];

console.log(findDiffBetweenArrays(t, b, (a, u) => a === u.key));
