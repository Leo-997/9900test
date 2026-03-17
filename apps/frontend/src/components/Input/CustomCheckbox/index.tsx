import CustomTypography from '@/components/Common/Typography';
import {
  Checkbox, CheckboxProps, FormControlLabel, FormControlLabelProps,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  labelDisabled: {
    pointerEvents: 'none',
    cursor: 'normal',
  },
}));

interface IProps extends CheckboxProps {
  labelProps: Omit<FormControlLabelProps, 'control'>;
}

export function CustomCheckbox({
  labelProps: {
    className: labelClassName,
    label,
    ...labelProps
  },
  ...props
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <FormControlLabel
      labelPlacement="end"
      aria-disabled={labelProps.disabled || false}
      disabled={labelProps.disabled || false}
      className={clsx({
        [classes.labelDisabled]: props.disabled,
        [labelClassName || '']: true,
      })}
      label={(
        <CustomTypography variant="bodyRegular">
          {label}
        </CustomTypography>
      )}
      {...labelProps}
      control={(
        <Checkbox {...props} />
      )}
    />
  );
}
