import { CorrectionReason } from '../types/Corrections.types';
import { ISelectOption } from '../types/misc.types';

export const correctionReasons = [
  'CHANGE_DIAG',
  'PURITY_FIT_WRONG',
  'MISSING_INFO',
  'WRONG_INFO',
  'ADD_NEW_INFO',
  'MODIFY_INFO',
] as const;

export const correctionReasonOptions: ISelectOption<CorrectionReason>[] = [
  { name: 'Change of diagnosis', value: 'CHANGE_DIAG' },
  { name: 'Purity fit wrong', value: 'PURITY_FIT_WRONG' },
  { name: 'Missing info', value: 'MISSING_INFO' },
  { name: 'Wrong info', value: 'WRONG_INFO' },
  { name: 'Add new info', value: 'ADD_NEW_INFO' },
  { name: 'Modify info', value: 'MODIFY_INFO' },
];
