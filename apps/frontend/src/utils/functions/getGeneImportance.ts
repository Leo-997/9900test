interface IGeneImportance {
  prismImp: number;
  pathImp: number;
  finalImp: number;
}

const getGeneImportance = (pathclass, prismclass): IGeneImportance => {
  const prismHigh = /^P,T1.*$/;
  const prismMedHigh1 = /^P,T2.*$/;
  const prismMedHigh2 = /^P$/;
  const prismMedLow = /^T[1-2].*$/;

  let pathImp = 0;
  let prismImp = 0;

  // check pathclass impact
  if (!pathclass) {
    pathImp = 0;
  } else if (pathclass.startsWith('C5') || pathclass.startsWith('C4')) {
    pathImp = 3;
  } else if (
    pathclass.startsWith('C3')
    || pathclass.startsWith('C3.8')
    || pathclass.startsWith('GUS')
  ) {
    pathImp = 2;
  } else if (pathclass.startsWith('C2')) {
    pathImp = 1;
  } else {
    pathImp = 0;
  }
  // check prismclass impact
  if (!prismclass) {
    prismImp = 0;
  } else if (prismHigh.test(prismclass)) {
    prismImp = 3;
  } else if (prismMedHigh1.test(prismclass) || prismMedHigh2.test(prismclass)) {
    prismImp = 2;
  } else if (prismMedLow.test(prismclass)) {
    prismImp = 1;
  } else {
    prismImp = 0;
  }

  // determine final impact class
  return { prismImp, pathImp, finalImp: Math.max(pathImp, prismImp) };
};

export default getGeneImportance;
