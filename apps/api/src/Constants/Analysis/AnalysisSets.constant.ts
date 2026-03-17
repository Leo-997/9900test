export const curationStatuses = [
  'Sequencing',
  'In Pipeline',
  'Ready to Start',
  'In Progress',
  'Done',
  'Failed',
  'Withdrawn',
] as const;

export const pseudoStatuses = [
  'N/A',
  'On Hold',
] as const;

export const failedStatusReasons = [
  'No Tumour',
  'Contaminated Germline',
  'No Donor',
] as const;

export const curationReviewStatuses = [
  'Not Started',
  'Ready for Review',
  'In Progress',
  'Completed',
] as const;

export const htsStatuses = [
  'Not Started',
  'In Progress',
  'Completed',
] as const;

export const clinicalStatuses = [
  'Ready to Start',
  'In Progress',
  'Done',
  'N/A',
  'On Hold',
] as const;

export const researchCandidateReasons = [
  'Case report',
  'Functional studies',
  'Further research',
] as const;

export const changeOrRefinementOptions = [
  'No change required',
  'Yes, change in diagnosis',
  'Yes, refinement in diagnosis',
  'Other scenario (see notes)',
] as const;

export const pathologistAgreementOptions = [
  'Yes, agrees/has changed',
  'No, does not agree',
  'N/A',
] as const;

// eslint-disable-next-line @typescript-eslint/naming-convention
const BALLSubtypes = [
  'CDX2/UBTF',
  'DUX4 rearranged',
  'ETV6::RUNX1',
  'ETV6::RUNX1-like',
  'Hyperdiploid',
  'Hypodiploid',
  'iAMP21',
  'IKZF1 N159Y',
  'IL3 rearranged',
  'KMT2A Group',
  'MEF2D rearranged',
  'MYC rearranged',
  'Near haploid',
  'NUTM1 rearranged',
  'PAX5 P80R',
  'PAX5alt',
  'Ph',
  'Ph-like',
  'TCF3::HLF',
  'TCF3::PBX1',
  'ZEB2/CEBPE',
  'ZNF384 Group',
] as const;

// eslint-disable-next-line @typescript-eslint/naming-convention
const TALLSubtypes = [
  'BCL11B rearranged',
  'ETP-like',
  'HOXA9 rearranged',
  'KMT2A rearranged',
  'MLLT10 rearranged',
  'NKX2-1 rearranged',
  'NKX2-5 rearranged',
  'NUP214 rearranged',
  'NUP98 rearranged',
  'SPI1 rearranged',
  'STAG2/LMO2 rearranged',
  'TAL1 DP-like',
  'TAL1 αβ-like',
  'TLX1 rearranged',
  'TLX3 rearranged',
  'TME-enriched',
] as const;

// eslint-disable-next-line @typescript-eslint/naming-convention
const AMLSubtypes = [
  'APL',
  'BCL11B',
  'BCR::ABL1',
  'CBFB::MYH11',
  'CBFB-GDXYa',
  'CEBPA',
  'DEK::NUP214',
  'ETS family',
  'GATA1',
  'GLIS rearranged',
  'HOX rearranged',
  'KAT6A rearranged',
  'KMT2A-PTD',
  'KMT2A rearranged',
  'MECOM',
  'MNX1',
  'NPM1',
  'NUP98 rearranged',
  'PICALM::MLLT10',
  'RBM15::MRTFA',
  'RUNX1::RUNX1T1',
  'UBTF',
] as const;

export const leukeamiaSubtypeOptions = [
  ...[
    ...BALLSubtypes,
    ...TALLSubtypes,
    ...AMLSubtypes,
  ].sort((a, b) => a.localeCompare(b)),
  'Unclassified/rare',
  'Unclassified',
  'Unknown',
  'N/A',
] as const;
