export const isValidPMCID = (pmcId: string): boolean => {
  const isValidPubMedId = /^\d+$/.test(pmcId);
  const isValidPMC = /^PMC\d+$/.test(pmcId);

  return isValidPubMedId || isValidPMC;
};
