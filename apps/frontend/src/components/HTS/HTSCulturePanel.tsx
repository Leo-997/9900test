import {
  Grid,
  Paper,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import { screenStatuses } from '@/constants/HTS/hts';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IBiosample } from '@/types/Analysis/Biosamples.types';
import DataTable from '../../layouts/Tables/DataTable';
import { IHTSCulture, IUpdateHTSCultureBody, ScreenStatus } from '../../types/HTS.types';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import HTSCultureDetails from './HTSCultureDetails';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: '0px 32px 16px 32px',
    borderRadius: '0px 0px 4px 4px',
  },
  summaryWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#022034',
  },
  link: {
    color: 'rgba(30, 134, 252, 1)',
  },
  image: {
    maxWidth: 240,
    maxHeight: 180,
    borderRadius: 8,
    marginTop: 8,
  },
}));

interface IProps {
  hts?: IHTSCulture;
  selectedBiosample: IBiosample;
  onSelectBiosample: (biosample: IBiosample) => void;
  cultures: IHTSCulture[];
  onSelectCulture: (culture: IHTSCulture) => void;
  onUpdateCulture: (body: IUpdateHTSCultureBody) => void;
}
export default function HTSCulturePanel({
  hts,
  cultures,
  onSelectCulture,
  selectedBiosample,
  onSelectBiosample,
  onUpdateCulture,
}: IProps): JSX.Element {
  const { isAssignedCurator } = useCuration();
  const classes = useStyles();

  const canSetHTSStatus = useIsUserAuthorised('curation.sample.hts.write', isAssignedCurator);

  const getBackgroundColor = (status?: ScreenStatus): string => {
    switch (status) {
      case 'PASS':
        return corePalette.green10;
      case 'FAIL':
        return corePalette.red10;
      default:
        return corePalette.white;
    }
  };

  return (
    <Paper elevation={0}>
      <Grid container className={classes.root}>
        <Grid container style={{ paddingTop: '16px' }}>
          <Grid size={{ lg: 7, xs: 12 }}>
            <CustomTypography variant="h5">
              HTS Culture
            </CustomTypography>
            <HTSCultureDetails
              data={hts}
              selectedBiosample={selectedBiosample}
              onSelectBiosample={onSelectBiosample}
              cultures={cultures}
              onSelectCulture={onSelectCulture}
            />
          </Grid>
          <Grid size={{ lg: 5, xs: 12 }}>
            <CustomTypography variant="h5" style={{ marginBottom: '16px' }}>
              QC Results
            </CustomTypography>
            <DataTable
              rows={[
                {
                  cells: [
                    { content: 'Layout  (# of compounds)' },
                    { content: '# of  compounds excluded' },
                    { content: 'r between replicates' },
                  ],
                },
                {
                  cells: [
                    { content: 'Layout 1 (48)' },
                    { content: hts?.qcL1Cnt ?? '-' },
                    { content: hts?.qcL1R ?? '-' },
                  ],
                },
                {
                  cells: [
                    { content: 'Layout 2 (36)' },
                    { content: hts?.qcL2Cnt ?? '-' },
                    { content: hts?.qcL2R ?? '-' },
                  ],
                },
                {
                  cells: [
                    { content: 'Layout 3 (48)' },
                    { content: hts?.qcL3Cnt ?? '-' },
                    { content: hts?.qcL3R ?? '-' },
                  ],
                },
                {
                  cells: [
                    { content: 'Layout 4 (18)' },
                    { content: hts?.qcL4Cnt ?? '-' },
                    { content: hts?.qcL4R ?? '-' },
                  ],
                },
                {
                  cells: [
                    { content: '# of control excluded', header: true },
                    { content: `Positive: ${hts?.qcPcCnt ?? '-'}` },
                    { content: `Negative: ${hts?.qcNcCnt ?? '-'}` },
                  ],
                },
                {
                  rowTemplate: 'qc-title qc-status qc-status',
                  cells: [
                    { content: 'QC', header: true, gridArea: 'qc-title' },
                    { content: hts?.qcStatus ?? '-', gridArea: 'qc-status' },
                  ],
                },
                {
                  rowTemplate: 'screen-title screen-status screen-status',
                  cells: [
                    {
                      content: 'Screen Status',
                      header: true,
                      gridArea: 'screen-title',
                      sx: {
                        backgroundColor: getBackgroundColor(hts?.screenStatus),
                      },
                    },
                    {
                      content: (
                        <AutoWidthSelect
                          key={`${hts?.biosampleId}-${hts?.screenName}-${hts?.screenStatus}`}
                          options={screenStatuses.map((s) => ({ name: s, value: s }))}
                          value={hts?.screenStatus}
                          onChange={(e): void => onUpdateCulture({
                            screenStatus: e.target.value as ScreenStatus,
                          })}
                          overrideReadonlyMode={!canSetHTSStatus}
                        />
                      ),
                      gridArea: 'screen-status',
                      sx: {
                        backgroundColor: getBackgroundColor(hts?.screenStatus),
                      },
                    },
                  ],
                },
                {
                  rowTemplate: 'final-comment qc-comment qc-comment',
                  cells: [
                    { content: 'Final Comment', header: true, gridArea: 'final-comment' },
                    { content: hts?.qcComment ?? '-', gridArea: 'qc-comment' },
                  ],
                },
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
