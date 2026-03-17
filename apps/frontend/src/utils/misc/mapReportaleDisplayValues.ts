import { Classification, ClassifierClassification } from '../../types/Common.types';

const getClassificationDisplayValue = (classification: Classification | null): string => {
  if (classification === 'Diagnostic') {
    return 'Dx';
  } if (classification === 'Prognostic') {
    return 'Px';
  } if (classification === 'Diagnostic + Prognostic') {
    return 'Dx + Px';
  }
  return classification || '';
};

const getClassifierClassificationDisplayValue = (reportable: ClassifierClassification): string => {
  switch (reportable) {
    case 'Supports Diagnosis':
      return 'Supports Dx';
    case 'Supports Change in Diagnosis':
      return 'Change Dx';
    case 'Not Reportable - Display':
      return 'NR - Display';
    case 'Not Applicable':
      return 'N/A';
    default:
      return reportable;
  }
};

export { getClassificationDisplayValue, getClassifierClassificationDisplayValue };
