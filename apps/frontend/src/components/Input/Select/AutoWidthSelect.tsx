import {
    Checkbox,
    Grid,
    MenuItem, Select,
    SelectProps,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ISelectOption } from '../../../types/misc.types';
import CustomTypography from '../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  select: {
    height: 40,
    borderRadius: 4,
  },
  selectMenu: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    height: 40,
  },
}));

interface IAutoWidthSelectProps<
  T extends string | number | undefined
> extends Omit<SelectProps, 'multiple' | 'native' | 'autoWidth'> {
  options: ISelectOption<T>[];
  multiple?: boolean;
  autoWidth?: boolean;
  title?: string;
  // Prop for disabling editing credentials to a role
  // eg, to a Secondary Curator on the Methylation Modal.
  overrideReadonlyMode?: boolean;
  defaultValue?: T | T[];
  className?: string;
}

export function AutoWidthSelect<T extends string | number| undefined>({
  options,
  overrideReadonlyMode,
  className,
  multiple = false,
  autoWidth = true,
  ...props
}: IAutoWidthSelectProps<T>): JSX.Element {
  const classes = useStyles();

  const isChecked = (opt: T, val: T[] = []): boolean => val.includes(opt);

  return (
    <Select
      variant="outlined"
      className={clsx(classes.select, className)}
      MenuProps={{
        // eslint-disable-next-line @typescript-eslint/naming-convention
        MenuListProps: { className: classes.selectMenu },
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
      }}
      autoWidth={autoWidth}
      multiple={multiple}
      {...props}
    >
      {options.map((option) => (
        <MenuItem
          key={`auto-width-select-${option.value}`}
          className={classes.selectItem}
          disabled={props.defaultValue === option.value || overrideReadonlyMode || option.disabled}
          value={option.value}
        >
          <Grid container gap="8px" alignItems="center">
            {multiple && (
              <Checkbox
                checked={isChecked(option.value as T, props.value as T[])}
              />
            )}
            <CustomTypography
              variant="bodyRegular"
              style={{
                maxWidth: '100%',
              }}
              truncate
              tooltipText={option.tooltip}
            >
              {option.name}
            </CustomTypography>
          </Grid>
        </MenuItem>
      ))}
    </Select>
  );
}
