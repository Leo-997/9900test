import { Box } from '@mui/material';
import CustomTypography from '../../../../Common/Typography';

import type { JSX } from "react";

export default function ListOfPaediatricCancerClinics(): JSX.Element {
  return (
    <Box display="flex" flexDirection="column">
      <CustomTypography variant="bodyRegular" fontWeight="bold">
        ZERO Cancer Genetics - Contact Details
      </CustomTypography>
      <CustomTypography variant="bodySmall">
        Phone: (02) 9382 0557
      </CustomTypography>
      <CustomTypography variant="bodySmall">
        Email: SCHN-SCH-PaedCPS@health.nsw.gov.au
      </CustomTypography>
    </Box>
  );
}
