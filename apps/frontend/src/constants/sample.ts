export const biosampleStatuses = [
  'tumour',
  'normal',
  'donor',
  'unknown',
] as const;

export const sampleTypes = [
  'wgs',
  'rnaseq',
  'panel',
  'methylation',
  'hts',
  'pdx',
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

export const liverKidneyGenePanels = [
  'Wilms tumour',
  'Hepatoblastoma and hepatocellular carcinoma',
] as const;

export const baseGenePanels = [
  'CNS',
  'Leukaemia and lymphoma',
  'Neuroblastoma',
  'Sarcoma',
  'Thyroid tumour',
  ...liverKidneyGenePanels,
] as const;

export const noPanelGenePanels = [
  // this is a 'pseudo' panel manually set for reports
  'No panel',
  'CNS no panel',
  'NBL no panel',
  'Hide gene panel',
] as const;

export const genePanels = [
  ...baseGenePanels,
  ...noPanelGenePanels,
] as const;

export const highRiskCohorts = [
  'Cohort 1: High-risk cancers',
  'Cohort 2: Rare tumours',
  'Cohort 13: Germline only',
] as const;

export const standardRiskCohorts = [
  'Cohort 3: Primary CNS tumours',
  'Cohort 4A: High-risk neuroblastoma at diagnosis',
  'Cohort 4B: Non-high-risk neuroblastoma',
  'Cohort 5: Acute myeloid leukaemia (AML), myelodysplastic syndrome and other leukaemias not classified as acute lymphoblastic leukaemia (ALL)',
  'Cohort 6: Acute lymphoblastic leukaemia (ALL)',
  'Cohort 7: Lymphomas',
  'Cohort 8: Sarcomas',
  'Cohort 9: Renal tumours',
  'Cohort 10: Hepatic and biliary tree tumours',
  'Cohort 11: Thyroid and endocrine cancers',
  'Cohort 12: Other tumours',
  'Cohort 14: Histiocytic disorders',
] as const;

// Constant numerically sorted by cohort (e.g. Cohort 1, 2, 3,..., 13)
// Especially useful for when the constant is used as menu options in filters
export const cohorts = [
  highRiskCohorts[0],
  highRiskCohorts[1],
  ...standardRiskCohorts,
  highRiskCohorts[2],
] as const;
