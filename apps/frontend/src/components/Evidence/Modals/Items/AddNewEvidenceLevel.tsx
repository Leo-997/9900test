import {
  Box, Checkbox, Chip, Divider, FormControlLabel, MenuItem, OutlinedInput, Select,
} from '@mui/material';
import { Dispatch, ReactNode, SetStateAction, useState, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import { evidenceLevels } from '../../../../constants/options';
import { InputEvidence } from '../../../../types/Evidence/EvidenceInput.types';
import OutlinedTextInput from '../../../Input/OutlinedTextInput';
import CustomTypography from '../../../Common/Typography';

const useStyles = makeStyles(() => ({
  chip: {
    height: '28px',
    backgroundColor: '#ECF0F3',
    marginRight: '4px',
  },
  checkboxChecked: {
    color: '#1E86FC !important',
  },
  checkboxUnchecked: {
    color: '#273957 !important',
  },
  divider: {
    height: '1px',
    width: '100%',
    margin: '40px 0',
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
  },
}));

interface IProps {
  evidence: InputEvidence,
  setClinicalSummary: Dispatch<SetStateAction<string>>,
  levels: string[],
  setLevels: Dispatch<SetStateAction<string[]>>,
  hideEvidenceLevel?: boolean;
}

export function AddNewEvidenceLevel({
  evidence,
  setClinicalSummary,
  levels,
  setLevels,
  hideEvidenceLevel = false,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [levelsMenu, setLevelsMenu] = useState<HTMLElement | null>(null);

  const handleLevelChange = (event): void => {
    const lv = event.target.value;
    if (event.target.checked) {
      setLevels((prev) => [...prev, lv]);
    } else {
      setLevels((prev) => prev.filter((l) => l !== lv));
    }
  };

  const render = (selected: string[]): ReactNode => {
    if ((selected as string[]).length > 2) {
      return (
        <>
          {(selected as string[]).slice(0, 2).map((s) => (
            <Chip
              key={s}
              className={classes.chip}
              label={<CustomTypography>{s}</CustomTypography>}
            />
          ))}
          <Chip
            key="excess-chip"
            className={classes.chip}
            label={(
              <CustomTypography
                tooltipText={(selected as string[])
                  .slice(2, (selected as string[]).length)
                  .join(', ')}
              >
                +
                {' '}
                {(selected as string[]).length - 2}
                {' '}
                more
              </CustomTypography>
            )}
          />
        </>
      );
    }

    if ((selected as string[]).length > 0) {
      return (selected as string[]).map((s) => (
        <Chip
          key={s}
          className={classes.chip}
          label={<CustomTypography>{s}</CustomTypography>}
        />
      ));
    }

    return (
      <CustomTypography style={{ color: 'rgb(133, 133, 133)' }}>
        Select one or more evidence levels
      </CustomTypography>
    );
  };

  return (
    <div>
      {evidence.ui && (
      <>
        <Divider className={classes.divider} />
        <OutlinedTextInput
          headerTitle="Clinical Summary"
          placeholder="Enter your clinical summary here"
          style={{ maxWidth: '85%', marginBottom: '24px', height: '48px' }}
          onChange={(e): void => setClinicalSummary(e.target.value)}
        />
        {!hideEvidenceLevel && (
        <Box display="flex" flexDirection="column">
          <CustomTypography variant="label" style={{ marginBottom: '8px' }}>
            Evidence Level
          </CustomTypography>
          <Select
            id="evidence-level-select"
            title="Evidence Level"
            multiple
            displayEmpty
            value={levels}
            MenuProps={{
              anchorOrigin: { vertical: 'top', horizontal: 'center' },
              transformOrigin: { vertical: 'top', horizontal: 'center' },
            }}
            style={{
              maxHeight: '48px',
              height: '48px',
              minWidth: '450px',
              maxWidth: '550px',
            }}
            onChange={handleLevelChange}
            onClick={(e): void => setLevelsMenu(e.currentTarget)}
            open={Boolean(levelsMenu)}
            input={<OutlinedInput id="select-multiple-chip" />}
            renderValue={(value): JSX.Element => (
              <Box display="flex" flexWrap="wrap" width="100%">
                {render(value as string[])}
              </Box>
            )}
          >
            {evidenceLevels.map((lv) => (
              <MenuItem className={classes.menuItem} key={lv}>
                <FormControlLabel
                  value={lv}
                  control={(
                    <Checkbox
                      classes={{
                        root: classes.checkboxUnchecked,
                        checked: classes.checkboxChecked,
                      }}
                      checked={levels.includes(lv)}
                      onChange={(e): void => {
                        handleLevelChange(e);
                        setLevelsMenu(null);
                      }}
                      disableRipple
                      disableFocusRipple
                    />
                            )}
                  style={{ width: '100%' }}
                  label={lv}
                  labelPlacement="end"
                />
              </MenuItem>
            ))}
          </Select>
        </Box>
        )}
      </>
      )}
    </div>
  );
}
