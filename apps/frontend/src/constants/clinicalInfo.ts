import {
  ClinicalInformationData,
  InfoType,
} from '../types/MTB/ClinicalInfo.types';
import { ISelectOption } from '../types/misc.types';

export const initialClinicalInformation: ClinicalInformationData = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Genetic test results prior to enrolment': {
    value: 'No',
    note: '',
    isHidden: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Relevant family history': {
    value: 'No',
    note: '',
    isHidden: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Relevant personal history': {
    value: 'No',
    note: '',
    isHidden: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Other relevant clinical information': {
    value: 'No',
    note: '',
    isHidden: false,
  },
};

export const clinicalInfoOptions: ISelectOption<InfoType>[] = [
  {
    name: 'Yes',
    value: 'Yes',
  },
  {
    name: 'No',
    value: 'No',
  },
  {
    name: 'Not reported',
    value: 'Not reported',
  },
];
