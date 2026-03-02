import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import {
    Box, Checkbox, FormControlLabel, Grid, Menu, MenuItem as MuiMenuItem,
    styled,
} from '@mui/material';
import {
    ChartScatterIcon, ChevronDownIcon, ChevronUpIcon, CirclePlusIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import CustomButton from '../Common/Button';
import MasterUpdateModal from '../RNASeq/MasterUpdateModal';
import TSNEPlotDialog from '../RNASeq/TSNEPlotDialog/TSNEPlotDialog';
import RNAExpressionGeneSelection from './RNAExpressionGeneSelection';

const MenuItem = styled(MuiMenuItem)(() => ({
  width: '300px',
}));

interface IProps {
  onHidePlots: (hidden: boolean) => void;
  disabled?: boolean;
}

export function RNASeqSearchFilterExtraOptions({
  onHidePlots,
  disabled,
}: IProps): JSX.Element {
  const { rnaBiosample } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const canUpdatePlots = (
    useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator)
    && !isReadOnly
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [expAnchorEl, setExpAnchorEl] = useState<HTMLElement | null>(null);
  const [masterUpdateOpen, setMasterUpdateOpen] = useState<boolean>(false);
  const [tsnePlotOpen, setTSNEPlotOpen] = useState<boolean>(false);

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      padding="0px 8px"
    >
      <CustomButton
        variant="text"
        size="small"
        label="More Options"
        endIcon={anchorEl ? (
          <ChevronUpIcon />
        ) : (
          <ChevronDownIcon />
        )}
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        disabled={disabled}
      />
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={(): void => setAnchorEl(null)}
      >
        <MenuItem>
          <FormControlLabel
            sx={{
              gap: '8px', display: 'flex', alignItems: 'center', width: '100%',
            }}
            control={(
              <Checkbox
                sx={{ marginRight: '8px' }}
                onChange={(e, checked): void => onHidePlots(checked)}
              />
            )}
            label="Hide Plots"
            labelPlacement="end"
          />
        </MenuItem>
        <MenuItem
          onClick={(e): void => setExpAnchorEl(e.currentTarget)}
        >
          <Grid container alignItems="center" gap="8px" justifyContent="space-between" width="100%">
            <Grid container alignItems="center" gap="8px">
              <ChartScatterIcon />
              Plot Expression
            </Grid>
            <CirclePlusIcon />
          </Grid>
        </MenuItem>
        <MenuItem
          onClick={(): void => setMasterUpdateOpen(true)}
          disabled={!canUpdatePlots}
        >
          <Grid container alignItems="center" gap="8px" justifyContent="space-between" width="100%">
            <Grid container alignItems="center" gap="8px">
              <Box width="24px" height="24px" />
              Update Plots
            </Grid>
            <CirclePlusIcon />
          </Grid>
        </MenuItem>
        <MenuItem
          onClick={(): void => setTSNEPlotOpen(true)}
        >
          <Grid container alignItems="center" gap="8px" justifyContent="space-between" width="100%">
            <Grid container alignItems="center" gap="8px">
              <Box width="24px" height="24px" />
              t-SNE Plot
            </Grid>
            <CirclePlusIcon />
          </Grid>
        </MenuItem>
      </Menu>
      <RNAExpressionGeneSelection
        open={Boolean(expAnchorEl)}
        anchorEl={expAnchorEl}
        onClose={(): void => setExpAnchorEl(null)}
      />
      <MasterUpdateModal
        open={masterUpdateOpen}
        onClose={(): void => setMasterUpdateOpen(false)}
      />
      <TSNEPlotDialog
        open={tsnePlotOpen}
        onClose={(): void => setTSNEPlotOpen(false)}
      />
    </Box>
  );
}
