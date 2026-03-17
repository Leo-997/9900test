import type { VariantType } from './misc.types';

export interface IClassifierVersion {
  id: string;
  type: Extract<VariantType, 'METHYLATION_CLASSIFIER' | 'RNA_CLASSIFIER'>;
  name: string;
  version: string;
  description: string;
  note?: string;
  showInAtlas: boolean;
}

export interface IClassifierVersionFilters {
  name?: string;
  showInAtlas?: boolean;
}

export type UpdateClassifierVersion = Pick<IClassifierVersion, 'note'>;
