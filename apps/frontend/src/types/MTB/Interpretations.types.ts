import { IClinicalComment } from '../Comments/ClinicalComments.types';
import { ReportType } from '../Reports/Reports.types';
import { IMolecularAlterationDetail } from './MolecularAlteration.types';

export interface IInterpretation {
  id: string;
  title: string;
  clinicalVersionId: string;
  molAlterationGroupId: string | null;
  order: number | null;
  reportType: ReportType;
  comments: IClinicalComment[];
  targets?: IMolecularAlterationDetail[];
}

export interface IInterpretationQuery {
  molAlterationGroupId?: string;
  reportType?: ReportType;
}

export interface ICreateInterpretationBody {
  title: string;
  molAlterationGroupId: string | null;
  order?: number;
  reportType: ReportType;
}

export interface IUpdateInterpretationBody {
  title?: string;
  molAlterationGroupId?: string;
}
