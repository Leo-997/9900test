import { Box } from '@mui/material';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

interface IProps {
  methId?: string;
}

export default function MethExpandedModalTitle({
  methId,
}: IProps): JSX.Element {
  return (
    <Box display="flex" gap="16px">
      <Box display="flex" flexDirection="column">
        <CustomTypography variant="label">
          Sentrix ID
        </CustomTypography>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          {methId?.split('_')[0]}
        </CustomTypography>
      </Box>
      <Box display="flex" flexDirection="column">
        <CustomTypography variant="label">
          Sentrix Position
        </CustomTypography>
        <CustomTypography variant="titleRegular" fontWeight="medium">
          {methId && methId.split('_').length > 1 ? methId?.split('_')[1] : ''}
        </CustomTypography>
      </Box>
    </Box>
  );
}
