import { IsIn } from 'class-validator';

export function IsSVType(validatorOptions?) {
  return IsIn(
    ['INV', 'BND', 'DEL', 'DUP', 'INS', 'SPLICE', 'SGL', 'INF', 'DISRUPTION'],
    validatorOptions,
  );
}
