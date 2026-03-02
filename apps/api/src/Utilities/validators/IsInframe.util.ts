import { IsIn, ValidationOptions } from 'class-validator';

export function IsInframe(
  validatorOptions?: ValidationOptions,
): PropertyDecorator {
  return IsIn(
    [
      'W',
      'W-',
      'WR',
      'W-R',
      'WR-',
      'WRP',
      'W-RP',
      'WR-P',
      'W-R-P',
      'R',
      'R-',
      'RP',
      'R-P',
      'P',
      'No',
      'Unknown',
      'N/A',
    ],
    validatorOptions,
  );
}
