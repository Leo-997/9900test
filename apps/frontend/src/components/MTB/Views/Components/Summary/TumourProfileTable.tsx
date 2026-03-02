import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { CustomCheckbox } from '@/components/Input/CustomCheckbox';
import { corePalette } from '@/themes/colours';
import { ITumourProfileColumn, ITumourProfileSummary } from '@/types/MTB/MolecularAlteration.types';
import {
    ITumourImmuneProfileSettings,
    ITumourMolecularProfileSettings,
} from '@/types/MTB/Settings.types';
import {
    Grid,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell as MuiTableCell,
    TableHead,
    TableRow,
    styled,
} from '@mui/material';
import { useMemo, useState, type JSX } from 'react';

const TableCell = styled(MuiTableCell)(() => ({
  height: '100%',
  padding: '0.6% 1.5% 0.6% 1.5%',
  backgroundColor: 'inherit',
  whiteSpace: 'nowrap',
}));

interface IProps<
  T extends ITumourMolecularProfileSettings | ITumourImmuneProfileSettings
> {
  summary: ITumourProfileSummary;
  defaultColumnSettings: ITumourProfileColumn<T>[];
  visibilitySettings: T | undefined;
  onToggleColumn?: (settingsKey: keyof T, checked: boolean) => Promise<void>;
  isPresentationMode: boolean;
  canEdit?: boolean;
  isExport?: boolean;
}

export function TumourProfileTable<
  T extends ITumourMolecularProfileSettings | ITumourImmuneProfileSettings
>({
  summary,
  defaultColumnSettings,
  visibilitySettings,
  onToggleColumn,
  isPresentationMode,
  canEdit = false,
  isExport = false,
}: IProps<T>): JSX.Element | undefined {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const columnSettings = useMemo<ITumourProfileColumn<T>[]>(
    () => defaultColumnSettings.map((columnSetting) => ({
      ...columnSetting,
      visible: visibilitySettings?.[columnSetting.settingsKey] as boolean ?? columnSetting.visible,
    })),
    [defaultColumnSettings, visibilitySettings],
  );

  const visibleColCount = columnSettings.filter((s) => s.visible).length;

  return (
    !isPresentationMode || (isPresentationMode && visibleColCount > 0) ? (
      <Grid>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ borderBottom: `2px solid ${corePalette.grey50}` }}>
              {columnSettings
                .filter((s) => s.visible)
                .map(({ label, key }) => (
                  <TableCell
                    key={key}
                  >
                    <CustomTypography variant="label">
                      {label}
                    </CustomTypography>
                  </TableCell>
                ))}
              {!isPresentationMode && !isExport && (
                <TableCell
                  align="right"
                  sx={{
                    width: '100px',
                  }}
                >
                  <CustomButton
                    label="Manage"
                    variant="text"
                    size="small"
                    disabled={!canEdit}
                    onClick={(e): void => setAnchorEl(e.currentTarget)}
                    sx={{
                      position: 'relative',
                      right: '30px',
                    }}
                  />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ borderBottom: `1px solid ${corePalette.grey30}` }}>
              {columnSettings
                .filter((s) => s.visible)
                .map(({ key, displayTransform }) => (
                  <TableCell
                    key={key}
                  >
                    <CustomTypography variant="bodySmall">
                      {displayTransform
                        ? displayTransform(summary[key], summary)
                        : summary[key]?.toString() || '-'}
                    </CustomTypography>
                  </TableCell>
                ))}
            </TableRow>
          </TableBody>
        </Table>
        <Menu
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={(): void => setAnchorEl(null)}
        >
          {columnSettings.map((column) => (
            <MenuItem key={column.settingsKey as string}>
              <CustomCheckbox
                labelProps={{ label: column.label }}
                checked={column.visible}
                onChange={(e, checked): void => {
                  onToggleColumn?.(column.settingsKey, checked);
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </Grid>
    ) : undefined
  );
}
