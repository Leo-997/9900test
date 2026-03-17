import { Classification, IReportableVariant, ClassifierClassification } from '../../../types/Common.types';

export const isClassified = ({
  classification,
}: Partial<IReportableVariant<Classification | ClassifierClassification>>): boolean => (
  Boolean(
    classification
    && classification.toLowerCase() !== ''
    && classification.toLowerCase() !== 'not applicable'
    && classification.toLowerCase() !== 'not reportable'
    && classification.toLowerCase() !== 'not reportable - display',
  )
);
