import { Box, Tooltip } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomButton from '../../../../../Common/Button';

interface IProps {
  confirmLabel: string,
  cancelLabel: string,
  confirmDisabled: boolean,
  confirmLoading: boolean,
  tooltipText: NonNullable<ReactNode>,
  handleConfirm: () => void,
  handleCancel: () => void,
}

export default function Footer({
  confirmLabel,
  cancelLabel,
  confirmDisabled,
  confirmLoading,
  tooltipText,
  handleConfirm,
  handleCancel,
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      height="80px"
      padding="0px 24px"
      borderTop={`1px solid ${corePalette.grey30}`}
      bgcolor={corePalette.white}
      sx={{ zIndex: 1 }}
    >
      <CustomButton
        label={cancelLabel}
        variant="warning"
        onClick={handleCancel}
      />
      <Tooltip
        title={tooltipText}
        placement="top"
      >
        <span>
          <CustomButton
            onClick={handleConfirm}
            label={confirmLabel}
            variant="bold"
            style={{ minWidth: '196px' }}
            disabled={confirmDisabled || confirmLoading}
            loading={confirmLoading}
          />
        </span>
      </Tooltip>
    </Box>
  );
}
