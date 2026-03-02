import { Dispatch, SetStateAction, type JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import CustomModal from '@/components/Common/CustomModal';

interface IRejectDrugWarningModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  drugName: string;
  onReject: () => void;
}

export default function RejectDrugWarningModal({
  open,
  setOpen,
  drugName,
  onReject,
}: IRejectDrugWarningModalProps): JSX.Element {
  return (
    <CustomModal
      title={`Are you sure you want to delete ${drugName}?`}
      content={(
        <CustomTypography variant="bodyRegular" fontWeight="regular">
          Deleting
          <b>
            {' '}
            {drugName}
            {' '}
          </b>
          will delete
          {' '}
          <b>ALL</b>
          {' '}
          recommendations using this drug version for this case.
        </CustomTypography>
      )}
      open={open}
      variant="alert"
      onClose={(): void => setOpen(false)}
      onConfirm={onReject}
    />
  );
}
