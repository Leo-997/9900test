import {
  Box, styled, SxProps, Theme,
} from '@mui/material';
import { CircleAlertIcon } from 'lucide-react';
import { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';

const WarningContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '8px',
  alignItems: 'center',
  bgcolor: theme.colours.core.red10,
  color: theme.colours.core.red200,
  border: `1px solid ${theme.colours.core.red200}`,
  width: 'fit-content',
}));

interface IProps {
  message: string;
  sx?: SxProps<Theme>;
}

export function ErrorMessageBox({ message, sx }: IProps): JSX.Element {
  return (
    <WarningContainer
      sx={sx}
    >
      <CircleAlertIcon size={16} />
      <CustomTypography variant="bodySmall" color="inherit">
        {message}
      </CustomTypography>
    </WarningContainer>
  );
}
