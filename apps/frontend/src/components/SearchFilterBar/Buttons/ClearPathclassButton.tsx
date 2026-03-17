import CustomButton from '@/components/Common/Button';
import { Dispatch, SetStateAction, type JSX } from 'react';

interface IProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  disabled: boolean;
}

export default function ClearPathclassButton({
  setModalOpen,
  disabled,
}: IProps): JSX.Element {
  return (
    <CustomButton
      label="Clear pathogenicity"
      variant="text"
      size="small"
      onClick={(): void => setModalOpen(true)}
      disabled={disabled}
    />
  );
}
