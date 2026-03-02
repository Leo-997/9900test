import { IsIn, ValidationOptions } from 'class-validator';

export function IsClassification(validatorOptions?: ValidationOptions): PropertyDecorator {
  return IsIn(
    [
      'Diagnostic',
      'Prognostic',
      'Diagnostic + Prognostic',
      'Response',
      'Drug Resistant',
      'Treatment',
      'Driver',
      'Other',
      'Supports Diagnosis',
      'Supports Change in Diagnosis',
      'Reportable',
      'Not Reportable - Display',
      'Not Applicable',
      'Not Reportable',
      '',
      null,
    ],
    validatorOptions,
  );
}
