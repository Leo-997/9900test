import React, { Dispatch, SetStateAction, useState, type JSX } from 'react';
import {
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DownloadIcon } from 'lucide-react';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import dayjs from 'dayjs';
import { corePalette } from '@/themes/colours';
import { DashboardExportOptions } from '../../../../../types/Search.types';
import CustomButton from '../../../../Common/Button';

const useStyles = makeStyles(() => ({
  exportWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface IExportButtonProps {
  exportOptions: DashboardExportOptions;
  setExportOptions: Dispatch<SetStateAction<DashboardExportOptions>>;
  getDashboardData: () => Promise<IAnalysisSet[]>;
  disabled?: boolean;
}

export default function ExportButton({
  exportOptions,
  setExportOptions,
  getDashboardData,
  disabled,
}: IExportButtonProps): JSX.Element {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Update the toggled state
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const key = event.target.value;
    const value = exportOptions[key];
    if (event.target.checked) {
      setExportOptions({
        ...exportOptions,
        [key]: {
          ...value,
          selected: true,
        },
      });
    } else {
      setExportOptions({
        ...exportOptions,
        [key]: {
          ...value,
          selected: false,
        },
      });
    }
  };

  const exportAsCSV = async (
    fetchData: () => Promise<IAnalysisSet[]>,
    options: DashboardExportOptions,
  ): Promise<void> => {
    setLoading(true);
    const dashboardData: IAnalysisSet[] = await fetchData();

    // Format data for export
    const exportData: string[][] = [];
    exportData.push(
      Object.keys(options)
        .filter((key) => options[key].selected)
        .map((key) => options[key].label),
    );

    for (const sample of dashboardData) {
      const sampleData: string[] = [];
      for (const option of Object.values(options)) {
        if (option.selected && option.key) {
          sampleData.push(
            option.transform
              ? option.transform(sample[option.key])
              : sample[option.key],
          );
        }
      }
      exportData.push(sampleData);
    }

    const csvContent = `data:text/csv;charset=utf-8,${exportData.map((e) => e.join(',')).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `ZeroDash Curation Dashboard Export ${dayjs().format('YYYYMMDD_hhmmss')}.csv`;
    link.click();
    link.remove();
    setLoading(false);
  };

  return (
    <div className={classes.exportWrapper}>
      {/* Base Export button */}
      <CustomButton
        variant="text"
        label="Export"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        loading={loading}
        disabled={disabled}
      />
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Grid
          container
          direction="column"
          // 7 rows with the padding for 16 px either side
          // and 3 columns that are 228px
          style={{
            height: 'calc(42px * 7 + 32px)',
            width: 'calc(228px * 3)',
            paddingTop: '16px',
          }}
        >
          {Object.keys(exportOptions).map((key, index) => (
            <Grid
              key={key}
              style={{
                padding: '0px 16px',
                // anything in the last col no border
                borderRight: index < 14
                  ? '1px solid #E0E0E0'
                  : undefined,
                flexBasis: 0,
              }}
            >
              <FormControlLabel
                value={key}
                control={(
                  <Checkbox
                    checked={exportOptions[key].selected}
                    onChange={handleSelect}
                  />
                  )}
                label={exportOptions[key].label}
                labelPlacement="end"
                sx={{
                  height: '42px',
                }}
              />
            </Grid>
          ))}
        </Grid>
        <Box
          display="flex"
          justifyContent="flex-end"
          padding="16px"
          borderTop={`1px solid ${corePalette.grey50}`}
        >
          <span>
            <CustomButton
              style={{ width: '100%' }}
              variant="bold"
              size="medium"
              label="Export as CSV"
              onClick={(): void => {
                exportAsCSV(
                  getDashboardData,
                  exportOptions,
                );
                setAnchorEl(null);
              }}
              disabled={Object.entries(exportOptions).every(([, v]) => !v.selected)}
            />
          </span>
        </Box>
      </Popover>
    </div>
  );
}
