import CustomChip from '@/components/Common/Chip';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { Grid, IconButton, styled } from '@mui/material';
import { XIcon } from 'lucide-react';
import CustomTypography from '../../Common/Typography';

import type { JSX } from "react";

const Header = styled(Grid)(() => ({
  zIndex: 500,
  borderRadius: 4,
  width: '100vw',
  margin: 0,
  height: '80px',
}));

interface IProps {
  geneName: string;
  handleClose: () => void;
}

export function TPMPlotNavBar({
  geneName,
  handleClose,
}: IProps): JSX.Element {
  const { rnaBiosample, analysisSet } = useAnalysisSet();

  return (
    <Header container direction="row" justifyContent="space-between" wrap="nowrap">
      <Grid padding="16px 24px">
        <Grid container direction="row" alignItems="center" gap="8px" wrap="nowrap">
          <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
            Patient ID:
            &nbsp;
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
        </Grid>
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <CustomTypography variant="bodyRegular" truncate>
            {rnaBiosample?.biosampleId}
          </CustomTypography>
        </Grid>
      </Grid>
      <Grid>
        <Grid container direction="row" alignItems="center" style={{ height: '100%' }}>
          <CustomTypography variant="titleRegular" fontWeight="medium" truncate>
            {geneName}
          </CustomTypography>
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        minWidth="80px"
        size={1}
      >
        <IconButton onClick={handleClose}>
          <XIcon />
        </IconButton>
      </Grid>
    </Header>
  );
}
