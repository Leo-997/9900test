import {
  Box, styled, Paper as MuiPaper,
} from '@mui/material';
import CustomTypography from '@/components/Common/Typography';
import { InfoIcon } from 'lucide-react';

import type { JSX } from "react";

const Paper = styled(MuiPaper)(() => ({
  paddingLeft: '25px',
  width: '100%',
  padding: 10,
  margin: '5px 0',
  height: 'auto',
}));

const Icon = styled(InfoIcon)(() => ({
  margin: '5px',
}));

interface IProps {
  originalBiosampleId: string;
}

export default function PairedBanner({
  originalBiosampleId,
}: IProps): JSX.Element {
  return (
    <Paper elevation={1}>
      <Box display="flex" flexDirection="row">
        <Icon size={14} />
        <CustomTypography variant="bodyRegular">
          This sample has been paired with prior sample
          {' '}
          {originalBiosampleId}
        </CustomTypography>
      </Box>
    </Paper>
  );
}
