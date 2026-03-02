const getGeneName = (gene: string): string => {
  if (gene === 'CD274') return 'CD274 (PD-L1)';
  if (gene === 'PDCD1LG2') return 'PDCD1LG2 (PD-L2)';
  return gene;
};

export default getGeneName;
