import { useState, type JSX } from 'react';
import {
  TableCell as MuiTableCell,
  styled,
  TableHead,
  TableRow,
} from '@mui/material';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../../../Common/Typography';
import ManageTableMenu from './ManageTableMenu';
import { IMolAltSummaryColumn } from '../../../../../types/MTB/MolecularAlteration.types';
import CustomButton from '../../../../Common/Button';
import { IGeneAltSettings, INonGeneAltSettings } from '../../../../../types/MTB/Settings.types';

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  height: '100%',
  padding: '0.6% 1.5% 0.6% 1.5%',
  backgroundColor: theme.colours.core.white,
  whiteSpace: 'nowrap',
}));

const TableCellLeft = styled(TableCell)({
  position: 'sticky',
  left: 0,
  width: '54px',
  minWidth: '54px',
});

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
  padding: 0,
});

interface IProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  frequencyUnits?: string;
  isPresentationMode?: boolean;
  canEdit?: boolean;
  isForNonGeneType?: boolean;
  columnSettings: IMolAltSummaryColumn<T>[];
  onToggleColumn: (
    settingsKey: keyof T,
    checked: boolean,
  ) => Promise<void>;
}

export function AlterationSummaryTableHeader<T extends IGeneAltSettings | INonGeneAltSettings>({
  frequencyUnits,
  columnSettings,
  isPresentationMode = false,
  canEdit = false,
  isForNonGeneType = false,
  onToggleColumn,
}: IProps<T>): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onManageBoxChecked = async (
    updatedItem: IMolAltSummaryColumn<T>,
    checked: boolean,
  ): Promise<void> => {
    await onToggleColumn(
      updatedItem.settingsKey,
      checked,
    );
  };

  const getLabel = (
    obj: IMolAltSummaryColumn<T>,
  ): string => {
    if (obj.label === 'Frequency' && frequencyUnits) {
      return `Frequency in ${frequencyUnits}`;
    }

    return obj.label;
  };

  return (
    <TableHead>
      <TableRow sx={{ borderBottom: `2px solid ${corePalette.grey50}` }}>
        {!isPresentationMode && (
          <TableCellLeft />
        )}
        {columnSettings.map((o, i) => (
          o.visible && (
            <TableCell
              key={`mol-alt-column-${o.key}-${o.visible}`}
              sx={{
                minWidth: o.minWidth,
                ...(i === 0 && {
                  position: 'sticky',
                  left: isPresentationMode ? 0 : '54px',
                }),
              }}
            >
              <CustomTypography variant="label">
                {getLabel(o)}
              </CustomTypography>
            </TableCell>
          )
        ))}
        <TableCellRight
          align="center"
          sx={{
            width: '100px',
            minWidth: isPresentationMode ? '10px' : '100px',
          }}
        >
          {!isPresentationMode && (
          <CustomButton
            label="Manage"
            variant="text"
            size="small"
            disabled={!canEdit}
            onClick={(e): void => setAnchorEl(e.currentTarget)}
          />
          )}
        </TableCellRight>
      </TableRow>
      <ManageTableMenu
        onChecked={onManageBoxChecked}
        molSummarySettingData={columnSettings}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        isForNonGeneType={isForNonGeneType}
      />
    </TableHead>
  );
}
