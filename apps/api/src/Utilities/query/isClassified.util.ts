import { ClassifierClassification, Classification } from 'Models/Curation/Misc.model';

export function isClassified(
  classification: Classification | ClassifierClassification,
): boolean {
  return classification
    && classification !== 'Not Reportable'
    && classification !== 'Not Reportable - Display'
    && classification !== 'Not Applicable';
}
