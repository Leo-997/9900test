import { reportTypes } from 'Constants/Reports/Reports.constants';
import { variantTypes } from 'Models/Misc/VariantType.model';

export const evidenceEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'COMMENT',
] as const;
