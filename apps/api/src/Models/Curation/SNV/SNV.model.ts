/* eslint-disable camelcase */

/**
 * The format of this model matches the database field names exactly.
 * This is intentional as it is only used for inserting to the database.
 */
export interface ISNV {
  variant_id: string;
  gene_id: number;
  chr: string;
  pos: string;
  ref: string;
  alt: string;
  transcript: string;
  exon: string;
  consequence: string;
  hgvs: string;
  pecan?: string;
  hotspot?: string;
}
