import { Classification, IReportableVariant, ClassifierClassification } from '../../../types/Common.types';
import { isClassified } from './isClassified';

export default function getUpdatedReportableValue<
  C extends Classification | ClassifierClassification = Classification
>(
  body: Partial<IReportableVariant<C>>,
  defaultValue: boolean | null,
): boolean | null {
  if (
    body.classification === null
    || (
      body.classification !== undefined
      && body.reportable === undefined
      && !isClassified(body)
    )
  ) return null;
  if (
    body.classification !== undefined
    && body.reportable === undefined
    && isClassified(body)
  ) {
    return true;
  }
  if (body.reportable === undefined) {
    return defaultValue;
  }
  return body.reportable;
}
