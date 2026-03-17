import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, type JSX } from 'react';

interface IProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  handleClearPathclass: () => Promise<void>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function ClearPathclassModal({
  isOpen,
  setIsOpen,
  handleClearPathclass,
  setLoading,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const handleConfirm = async (): Promise<void> => {
    setLoading(true);
    try {
      await handleClearPathclass();
      setIsOpen(false);
    } catch (error) {
      enqueueSnackbar('Could not clear pathogenicity, please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      title="Clear Pathogenicity"
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      content={(
        <>
          <CustomTypography>
            This action will clear the Pathogenicity value for all the results in this tab.
          </CustomTypography>
          <CustomTypography>
            Would you like to proceed?
          </CustomTypography>
        </>
      )}
      onConfirm={handleConfirm}
    />
  );
}
