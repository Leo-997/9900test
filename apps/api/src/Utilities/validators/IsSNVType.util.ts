import { IsIn } from 'class-validator';

export function IsSNVType(validatorOptions?) {
  return IsIn(['somatic', 'germline'], validatorOptions);
}
