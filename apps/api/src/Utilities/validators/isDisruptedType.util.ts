import { disruptedTypes } from 'Models/Curation/SV/SVSample.model';
import { IsIn, ValidationOptions } from 'class-validator';

export function IsDisruptedType(
  validatorOptions?: ValidationOptions,
): PropertyDecorator {
  return IsIn(
    disruptedTypes,
    validatorOptions,
  );
}
