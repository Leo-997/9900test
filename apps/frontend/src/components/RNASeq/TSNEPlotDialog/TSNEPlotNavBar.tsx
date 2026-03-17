import CustomChip from '@/components/Common/Chip';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { Box, IconButton, styled } from '@mui/material';
import { XIcon } from 'lucide-react';
import CustomTypography from '@/components/Common/Typography';

import type { JSX } from "react";

const Header = styled(Box)(() => ({
  zIndex: 500,
  borderRadius: 4,
  width: '100vw',
  margin: 0,
  height: '80px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

interface IProps {
  handleClose: () => void;
}

export function TSNEPlotNavBar({
  handleClose,
}: IProps): JSX.Element {
  const { rnaBiosample, analysisSet } = useAnalysisSet();

  return (
    <Header>
      <Box
        padding="16px 24px"
      >
        <Box
          display="flex"
          alignItems="center"
          gap="8px"
        >
          <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
            Patient ID:
            {' '}
            {analysisSet.patientId}
          </CustomTypography>
          {analysisSet.zero2FinalDiagnosis && (
            <CustomChip
              size="medium"
              label={analysisSet.zero2FinalDiagnosis}
              backgroundColour={corePalette.green10}
              colour={corePalette.green300}
            />
          )}
        </Box>
        <Box>
          <CustomTypography variant="bodyRegular" truncate>
            {rnaBiosample?.biosampleId}
          </CustomTypography>
        </Box>
      </Box>
      <Box>
        <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
          t-SNE Plot
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minWidth="80px"
      >
        <IconButton onClick={handleClose}>
          <XIcon />
        </IconButton>
      </Box>
    </Header>
  );
}
