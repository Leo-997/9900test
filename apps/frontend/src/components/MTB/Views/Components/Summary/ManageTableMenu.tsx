import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Menu,
  MenuItem,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { IMolAltSummaryColumn } from '../../../../../types/MTB/MolecularAlteration.types';
import { IGeneAltSettings, INonGeneAltSettings } from '../../../../../types/MTB/Settings.types';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import OutlinedInput from '../../../../Input/OutlinedTextInput';

const useStyle = makeStyles(() => createStyles({
  menuItem: {
    height: '40px',
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

interface IManageTableMenuProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  isForNonGeneType: boolean;
  onChecked: (item: IMolAltSummaryColumn<T>, checked: boolean) => void | Promise<void>;
  molSummarySettingData: IMolAltSummaryColumn<T>[];
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

export default function ManageTableMenu<T extends IGeneAltSettings | INonGeneAltSettings>({
  onChecked,
  molSummarySettingData,
  anchorEl,
  setAnchorEl,
  isForNonGeneType,
}: IManageTableMenuProps<T>): JSX.Element {
  const classes = useStyle();
  const {
    clinicalVersion,
    updateFrequencyUnits,
  } = useClinical();

  const [freqUnits, setFreqUnits] = useState<string>(clinicalVersion.frequencyUnits || '');

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      keepMounted
      MenuListProps={{ disablePadding: true }}
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      disableRestoreFocus
    >
      <FormGroup sx={{ gap: '0 !important' }}>
        {molSummarySettingData.map((item, i) => (
          <MenuItem
            key={item.key}
            disabled={i === 0}
            className={classes.menuItem}
          >
            <FormControlLabel
              value={item.label}
              control={(
                <Checkbox
                  disabled={i === 0}
                  checked={item.visible}
                  onChange={(e, checked): void => {
                    onChecked(item, checked);
                  }}
                />
              )}
              label={item.label}
              labelPlacement="end"
            />
          </MenuItem>
        ))}
        {!isForNonGeneType && (
          <>
            <Divider sx={{ margin: '0 !important' }} />
            <MenuItem
              className={classes.menuItem}
              sx={{ height: '52px !important', margin: 0 }}
            >
              <OutlinedInput
                value={freqUnits}
                onBlur={(): void => updateFrequencyUnits(freqUnits)}
                onChange={(e): void => setFreqUnits(e.target.value)}
                onKeyDown={(e): void => {
                  if (e.key === 'Enter') {
                    updateFrequencyUnits(freqUnits);
                  }
                }}
                placeholder="Frequency units"
                size="small"
                sx={{ height: '34px' }}
              />
            </MenuItem>
          </>
        )}
      </FormGroup>
    </Menu>
  );
}
