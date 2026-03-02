import {
  Checkbox,
  FormHelperText,
  MenuItem,
  Select as MuiSelect,
  SelectProps,
  // SelectProps,
} from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import InputWrapper from '../InputWrapper';
import CustomTypography from '../../Common/Typography';
import { ISelectOption } from '../../../types/misc.types';

const useStyles = makeStyles(() => ({
  selectButton: {
    width: '100%',
    height: 54,
    borderRadius: 4,
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
    maxHeight: '350px',
  },
  selectItem: {
    height: 44,

    '&:hover': {
      background: '#F3F7FF',
    },
  },
  textField: {
    height: 54,
    width: '100%',
  },
  errorText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FF2945',
    textTransform: 'uppercase',
  },
  checkboxChecked: {
    color: '#1E86FC !important',
  },
  checkboxUnchecked: {
    color: '#273957 !important',
  },
}));

interface ISelectInputProps<
  T extends string | number | readonly string[] | undefined
> extends Omit<SelectProps, 'multiple' | 'native' | 'autoWidth'> {
  options: ISelectOption<T>[];
  multiple?: boolean;
  autoWidth?: boolean;
  headerTitle?: string;
  placeholder?: string;
  inputContainerClassName?: string;
  errorText?: string;
  className?: string;
}

export default function Select<
  T extends string | number | readonly string[] | undefined
>(
  props: ISelectInputProps<T>,
): JSX.Element {
  const classes = useStyles();
  const {
    headerTitle,
    options,
    inputContainerClassName,
    placeholder,
    errorText,
    value,
    multiple,
    ...rest
  } = props;

  const isChecked = (val: T[], opt: T): boolean => val.includes(opt);

  return (
    <InputWrapper
      headerTitle={
        errorText ? (
          <FormHelperText error className={classes.errorText}>
            {errorText}
          </FormHelperText>
        ) : (
          headerTitle
        )
      }
      inputContainerClassName={inputContainerClassName}
    >
      <MuiSelect
        variant="outlined"
        displayEmpty
        className={classes.selectButton}
        MenuProps={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          MenuListProps: { className: classes.select },
        }}
        value={value}
        multiple={multiple}
        {...rest}
      >
        <MenuItem value="" disabled>
          {placeholder ?? 'Select'}
        </MenuItem>
        {options.map(({ name, value: val }) => (
          <MenuItem
            key={name}
            value={val}
            className={classes.selectItem}
          >
            {multiple && (
              <Checkbox
                checked={isChecked(value as T[], val)}
                className={clsx({
                  [classes.checkboxChecked]: isChecked(value as T[], val),
                  [classes.checkboxUnchecked]: !isChecked(value as T[], val),
                })}
              />
            )}
            <CustomTypography
              variant="bodyRegular"
              truncate
            >
              {name}
            </CustomTypography>
          </MenuItem>
        ))}
      </MuiSelect>
    </InputWrapper>
  );
}
