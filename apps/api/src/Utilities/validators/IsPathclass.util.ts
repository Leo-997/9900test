import { IsIn, ValidationOptions } from 'class-validator';

export function IsPathclass(
  validatorOptions?: ValidationOptions,
): PropertyDecorator {
  return IsIn(
    [
      'C5: Pathogenic',
      'C4: Likely Pathogenic',
      'C3.8: VOUS',
      'C3: VOUS',
      'GUS',
      'C2: Likely Benign',
      'C1: Benign',
      'False Positive',
      'Unclassified',
    ],
    validatorOptions,
  );
}
