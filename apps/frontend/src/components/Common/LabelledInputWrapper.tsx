import { corePalette } from '@/themes/colours';
import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomTypography from './Typography';

interface IProps {
  children: ReactNode;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  sx?: SxProps<Theme>;
  required?: boolean;
}

export default function LabelledInputWrapper({
  children,
  label,
  helperText,
  errorMessage,
  sx,
  required,
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={sx}
    >
      {label && (
        <Box display="flex" gap="4px">
          <CustomTypography variant="label">
            {label}
          </CustomTypography>
          {required && (
            <CustomTypography variant="label" color={corePalette.red200}>
              *
            </CustomTypography>
          )}
        </Box>
      )}
      {helperText && (
        <CustomTypography
          variant="bodySmall"
          color={corePalette.grey100}
        >
          {helperText}
        </CustomTypography>
      )}
      {children}
      {errorMessage && (
        <CustomTypography
          variant="label"
          color={corePalette.red200}
        >
          {errorMessage}
        </CustomTypography>
      )}
    </Box>
  );
}
