import { variantTypes } from '../Common/variants';
import { reportTypes } from '../Reports/reports';

export const curationTherapiesEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'COMMENT',
];
