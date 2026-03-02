import { corePalette } from '@/themes/colours';
import {
  OutlinedInput, OutlinedInputProps, SxProps, Theme,
} from '@mui/material';
import { CircleAlert } from 'lucide-react';
import LabelledInputWrapper from './LabelledInputWrapper';

import type { JSX } from "react";

interface IProps extends OutlinedInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  wrapperSx?: SxProps<Theme>;
}

export default function CustomOutlinedInput({
  label,
  helperText,
  error,
  errorMessage,
  multiline,
  fullWidth,
  wrapperSx,
  ...props
}: IProps): JSX.Element {
  return (
    <LabelledInputWrapper
      label={label}
      helperText={helperText}
      errorMessage={errorMessage}
      sx={{
        width: fullWidth ? '100%' : undefined,
        ...wrapperSx,
      }}
    >
      <OutlinedInput
        id="custom-outlined-input"
        multiline={multiline}
        error={error}
        endAdornment={error && !props.endAdornment
          ? (
            <CircleAlert
              fill={corePalette.red150}
              stroke={corePalette.white}
            />
          )
          : props.endAdornment}
        fullWidth={fullWidth}
        {...props}
      />
    </LabelledInputWrapper>
  );
}
