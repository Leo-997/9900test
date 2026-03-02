export const scopes = [
  // Curation
  'curation.sample.read',
  'curation.sample.write',
  'curation.sample.assigned.write',
  'curation.status.write',
  'curation.sample.hts.write',
  'curation.evidence.write',
  'curation.gene.list.write',
  'curation.sample.download',
  'curation.sample.hts.download',

  // Clinical
  'clinical.sample.read',
  'clinical.sample.write',
  'clinical.sample.assigned.write',
  'clinical.sample.suggestion.write',

  // File Tracker
  'file.download',

  // Evidence
  'evidence.write',
  'evidence.download',

  // Report
  'report.read',
  'report.assign',
  'report.mtb.write',
  'report.mtb.content.write',
  'report.molecular.write',
  'report.molecular.content.write',
  'report.germline.write',
  'report.germline.content.write',
  'report.redacted.write',
  'report.download',
] as const;
export type Scope = typeof scopes[number];

export const SCOPES_KEY = 'SCOPES';
