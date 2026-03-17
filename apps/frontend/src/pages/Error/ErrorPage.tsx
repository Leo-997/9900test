import CustomButton from '@/components/Common/Button';
import { Box } from '@mui/material';
import CustomTypography from '../../components/Common/Typography';

import type { JSX } from "react";

interface IProps {
  message?: string;
  returnTo?: 'dashboard' | 'login';
}

export function ErrorPage({
  message,
  returnTo,
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      gap="16px"
    >
      <CustomTypography variant="bodyRegular">
        {message}
      </CustomTypography>
      <CustomButton
        label={returnTo === 'login' ? 'Return to login' : 'Return to dashboard'}
        variant="bold"
        onClick={(): void => {
          if (returnTo === 'login') {
            window.location.href = '/login';
          } else {
            window.location.href = '/dashboard';
          }
        }}
      />
    </Box>
  );
}
