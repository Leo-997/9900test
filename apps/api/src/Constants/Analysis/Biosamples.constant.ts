export const sampleTypes = [
  'wgs',
  'rnaseq',
  'panel',
  'methylation',
  'hts',
  'pdx',
] as const;

export const biosampleStatuses = [
  'normal',
  'tumour',
  'donor',
] as const;

export const biosampleTypes = [
  'dna',
  'rna',
  'protein',
] as const;

export const biosampleSources = [
  'normal',
  'tumour',
  'pdx',
  'cells',
  'ctdna',
  'ctc',
  'csf',
  'hts',
] as const;

export const specimens = [
  'TT',
  'BMA',
  'BMT',
  'CSF',
  'PB',
  'SK',
  'PF',
  'CL',
  'PDX',
  'HTS',
  'CC',
  'DNA,RNA',
  'PBSC',
  'OTHER',
] as const;

export const specimenStates = [
  'fresh',
  'snap_frozen',
  'cryopreserved',
  'ffpe_block',
  'ffpe_slides',
  'dna',
  'rna',
  'other',
] as const;
