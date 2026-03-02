import React, { type JSX } from 'react';
import { withStyles } from '@mui/styles';
import { TextField } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/naming-convention
const CSSTextField = withStyles({
  root: {
  },
})(TextField);

interface IMultilineTextInputProps {
  value?: string;
  onTextChange?: (inputText: string) => void;
  placeholder?: string;
}

export default function MultilineTextInput({
  value,
  onTextChange,
  placeholder = '',
}: IMultilineTextInputProps): JSX.Element {
  return (
    <CSSTextField
      id="outlined-multiline-static"
      multiline
      variant="outlined"
      value={value}
      placeholder={placeholder}
      onChange={(event): void => {
        if (onTextChange) onTextChange(event?.target?.value as string);
      }}
    />
  );
}
