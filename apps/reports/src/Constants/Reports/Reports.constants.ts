export const reportSortColumns = [
  'drafted',
  'finalised',
] as const;

export const reportOptions = [
  {
    value: 'MOLECULAR_REPORT',
    name: 'Molecular Report',
    abbreviation: 'FT',
    downloadName: 'Molecular Report',
  },
  {
    value: 'MTB_REPORT',
    name: 'MTB Report',
    abbreviation: 'MTB',
    downloadName: 'MTB Report',
  },
  {
    value: 'GERMLINE_REPORT',
    name: 'Germline Report',
    abbreviation: 'G',
    downloadName: 'Germline Cancer Genetics Report',
  },
] as const;
