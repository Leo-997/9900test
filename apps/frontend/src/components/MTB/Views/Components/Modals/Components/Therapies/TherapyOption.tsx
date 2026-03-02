import {
  Box, Checkbox, FormControlLabel,
  OutlinedInput,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ITherapyOption } from '@/types/Therapies/CommonTherapies.types';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  checkboxFormGroup: {
    marginLeft: '0',
    gap: '8px',
    display: 'flex',
    width: '140px',
  },
}));

interface IProps {
  checkboxLabel: string;
  option: ITherapyOption;
  onChange: (option: ITherapyOption) => void;
}

export default function TherapyOption({
  checkboxLabel,
  option,
  onChange,
}: IProps): JSX.Element {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center">
      <FormControlLabel
        className={classes.checkboxFormGroup}
        control={(
          <Checkbox
            checked={option.includeOption}
            onChange={(e, checked): void => onChange({ includeOption: checked })}
          />
        )}
        label={(
          <CustomTypography>
            {checkboxLabel}
          </CustomTypography>
        )}
      />
      {option.includeOption && (
        <OutlinedInput
          defaultValue={option.note}
          onChange={(e): void => onChange({
            ...option,
            note: e.target.value,
          })}
          placeholder="Therapy details"
          sx={{
            height: '40px',
            width: 'calc(100% - 140px)',
          }}
        />
      )}
    </Box>
  );
}
