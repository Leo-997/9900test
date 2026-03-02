import {
  FormHelperText,
  OutlinedInput as MuiOutlinedInput,
  OutlinedInputProps,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { makeStyles } from '@mui/styles';
import InputWrapper from '../InputWrapper';

const useStyles = makeStyles(() => ({
  textField: {
    height: 54,
    width: '100%',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    // eslint-disable-next-line @typescript-eslint/naming-convention
      '-webkit-appearance': 'none',
      margin: 0,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& input[type=number]': {
    // eslint-disable-next-line @typescript-eslint/naming-convention
      '-moz-appearance': 'textfield',
    },
  },
  errorText: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FF2945',
    textTransform: 'uppercase',
  },
}));

interface ISelectInputProps extends OutlinedInputProps {
  headerTitle?: string;
  value?: string | number;
  inputContainerClassName?: string;
  errorText?: string;
  helperText?: string;
  type?: string;
  titleTooltip?: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const OutlinedInput = React.forwardRef((Props: ISelectInputProps, ref) => {
  const classes = useStyles();
  const {
    headerTitle,
    value,
    inputContainerClassName,
    errorText,
    error,
    helperText,
    type = 'text',
    titleTooltip,
    ...rest
  } = Props;

  return (
    <InputWrapper
      headerTitle={headerTitle}
      inputContainerClassName={inputContainerClassName}
      titleTooltip={titleTooltip}
    >
      <>
        <FormHelperText style={{ marginTop: 0 }}>{helperText}</FormHelperText>
        <MuiOutlinedInput
          ref={ref}
          className={classes.textField}
          value={value}
          type={type}
          error={!!errorText || error}
          notched={false}
          {...rest}
        />
        {errorText && (
          <FormHelperText error className={classes.errorText}>
            {errorText}
          </FormHelperText>
        )}
      </>
    </InputWrapper>
  );
});

export default OutlinedInput;
