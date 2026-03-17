import { IsIn, ValidationOptions } from 'class-validator';

export function IsPlatform(
  validatorOptions?: ValidationOptions,
): PropertyDecorator {
  return IsIn(['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR', 'No'], validatorOptions);
}
