import { archiveTabs } from '../../constants/Clinical/archive';
import { IGene, IGeneMutation } from '../Common.types';
import { ISortOptions } from '../Search.types';
import { IMolecularAlterationDetail } from './MolecularAlteration.types';

export type ArchiveTabs = typeof archiveTabs[number];

export interface IArchiveSamplesQuery extends ISortOptions {
  search?: string;
  genes?: IGene[];
  geneMutations?: IGeneMutation[];
  classifiers?: string[];
  cohort?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
}

export interface IArchiveSample {
  clinicalVersionId: string;
  analysisSetId: string;
  patientId: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  mtbDate?: string | null;
  relevantMolAlterations?: IMolecularAlterationDetail[];
}
