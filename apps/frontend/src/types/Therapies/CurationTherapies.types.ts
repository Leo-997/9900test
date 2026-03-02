/* CURATION THERAPY TYPES */

import { curationTherapiesEntityTypes } from '@/constants/Curation/therapies';
import { ITherapyBase } from './CommonTherapies.types';
import { ICurationTherapyDrugs } from '../Drugs/Drugs.types';
import { ISortOptions } from '../Search.types';

// Used for linking a therapy to a comment
export type CurationTherapyEntityTypes = typeof curationTherapiesEntityTypes[number];

export interface ICurationTherapyBase extends ITherapyBase {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ICreateCurationTherapyDrug {
  externalDrugClassId: string;
  externalDrugVersionId?: string;
}

export interface ICurationTherapy extends ICurationTherapyBase {
  drugs: ICurationTherapyDrugs[];
}

export interface ICreateCurationTherapy extends Omit<
  ICurationTherapyBase,
'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
> {
  analysisSetId: string;
  entityId: string | number;
  entityType: CurationTherapyEntityTypes;
  drugs: ICreateCurationTherapyDrug[]
}

export interface ITherapiesQuery extends ISortOptions {
  entityId?: string | number;
  entityType?: CurationTherapyEntityTypes;
  searchQuery?: string;
  drugClassIds?: string[];
  clinicalDrugIds?: string[];
  includesChemotherapy?: boolean;
  includesRadiotherapy?: boolean;
  page?: number;
  limit?: number;
}

export interface ITherapyXref {
  therapyId: string;
  entityType: CurationTherapyEntityTypes;
  entityId: string | number;
}
