import CustomButton from '@/components/Common/Button';
import {
    Box, Checkbox, FormControlLabel, Grid, Menu, MenuItem, Popover, styled,
} from '@mui/material';
import { DownloadIcon } from 'lucide-react';
import { useRef, useState, type JSX } from 'react';
import dayjs from 'dayjs';
import { taskDashboardExportOptions } from '@/constants/TaskDashboard/export';
import { IOverviewExport, TaskDashboardExportOptions } from '@/types/TaskDashboard/TaskDashboard.types';
import { corePalette } from '@/themes/colours';

const ExportWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

interface IProps {
  getDashboardData: () => Promise<IOverviewExport[]>;
  disabled?: boolean;
}
export default function OverviewExportButton({
  getDashboardData,
  disabled,
}: IProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [dashboardToExport, setDashboardToExport] = useState<keyof TaskDashboardExportOptions>('Overview');
  const [exportOptions, setExportOptions] = useState<
    TaskDashboardExportOptions[keyof TaskDashboardExportOptions]
  >(taskDashboardExportOptions.Overview);

  const exportButtonRef = useRef<HTMLButtonElement | null>(null);

  const isOverviewExport = dashboardToExport === 'Overview';

  const getPopoverBorderRight = (index: number): string | undefined => {
    const indexComparisonNumber = isOverviewExport ? 16 : 14;

    return index < indexComparisonNumber ? `1px solid ${corePalette.grey50}` : undefined;
  };

  const handleMenuItemClick = (
    dashboard: keyof TaskDashboardExportOptions,
  ): void => {
    setDashboardToExport(dashboard);
    setExportOptions(taskDashboardExportOptions[dashboard]);
    setMenuAnchorEl(null);
    setPopoverAnchorEl(exportButtonRef.current);
  };

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
    fetchData: () => Promise<IOverviewExport[]>,
    options: TaskDashboardExportOptions[keyof TaskDashboardExportOptions],
  ): Promise<void> => {
    setLoading(true);

    const dashboardData: IOverviewExport[] = await fetchData();

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
        if (option.selected) {
          if (option.key) {
            sampleData.push(
              option.transform
                ? option.transform(sample[option.key])
                : sample[option.key],
            );
          }
          if (!option.key && option.transform) {
            sampleData.push(option.transform(sample));
          }
        }
      }

      exportData.push(sampleData);
    }

    const dashboardName = isOverviewExport ? 'Overview' : 'Curation';
    const csvContent = `data:text/csv;charset=utf-8,${exportData.map((e) => e.join(',')).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `ZeroDash ${dashboardName} Dashboard Export ${dayjs().format('YYYYMMDD_hhmmss')}.csv`;
    link.click();
    link.remove();
    setLoading(false);
  };

  return (
    <ExportWrapper>
      <CustomButton
        ref={exportButtonRef}
        variant="text"
        size="small"
        label="Export"
        startIcon={<DownloadIcon />}
        onClick={(e): void => setMenuAnchorEl(e.currentTarget)}
        loading={loading}
        disabled={disabled}
      />
      <Menu
        open={Boolean(menuAnchorEl)}
        anchorEl={menuAnchorEl}
        onClose={(): void => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={():void => handleMenuItemClick('Overview')}>
          Overview
        </MenuItem>
        <MenuItem onClick={():void => handleMenuItemClick('Curation')}>
          Curation
        </MenuItem>
      </Menu>
      <Popover
        anchorEl={popoverAnchorEl}
        open={Boolean(popoverAnchorEl)}
        onClose={(): void => setPopoverAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Grid
          container
          direction="column"
          // OVERVIEW EXPORT OPTIONS:
          // 8 rows with the padding for 16 px either side
          // and 3 columns that are 248px
          // CURATION EXPORT OPTIONS:
          // 7 rows with the padding for 16 px either side
          // and 3 columns that are 228px
          style={{
            height: `calc(42px * ${isOverviewExport ? '8' : '7'} + 32px)`,
            width: `calc(${isOverviewExport ? '248' : '228'}px * 3)`,
            paddingTop: '16px',
          }}
        >
          {Object.keys(exportOptions).map((key, index) => (
            <Grid
              key={key}
              style={{
                padding: '0px 16px',
                // anything in the last col no border
                borderRight: getPopoverBorderRight(index),
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
          borderTop="1px solid #E0E0E0"
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
                setPopoverAnchorEl(null);
              }}
              disabled={Object.entries(exportOptions).every(([, v]) => !v.selected)}
            />
          </span>
        </Box>
      </Popover>
    </ExportWrapper>
  );
}
