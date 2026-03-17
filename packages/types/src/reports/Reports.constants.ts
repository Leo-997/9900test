import { variantTypes } from '../variants/Variants.constants';

export const reportSortColumns = [
  'drafted',
  'finalised',
] as const;

export const reportTypes = ['MOLECULAR_REPORT', 'MTB_REPORT', 'GERMLINE_REPORT', 'PRECLINICAL_REPORT'] as const;
export const reportPseudoStatuses = ['On Hold', 'N/A'] as const;

export const reportMetadataKeys = [
  'molecular.hidePanel',
  'preclinical.htsBiosampleId',
  'preclinical.htsScreen',
  'germline.attachments',
  'germline.forceApproval',
  ...variantTypes.map((v) => `report.no.result.message.${v}` as const),
  ...variantTypes.map((v) => `report.result.order.${v}` as const),
] as const;
