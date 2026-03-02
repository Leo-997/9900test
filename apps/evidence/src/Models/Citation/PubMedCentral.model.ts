/* eslint-disable @typescript-eslint/naming-convention */
export type PMCCreators = string | string[]

// It is either a string of one date
// or an array with several dates, one of which is the journal publication date
// We consider the latest date as the journal publication date
export type PMCDate = string | string[] | undefined;

export type PMCIdentifiers = string | string[];

export interface IPMCRecord {
  'dc:title': string;
  'dc:creator': PMCCreators;
  'dc:date': PMCDate;
  'dc:source': string;
  'dc:identifier': PMCIdentifiers;
  // There are other fields like "dc:language", "dc:subject", etc.
  [key: string]: any;
}
