import { corePalette } from '@/themes/colours';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, XIcon } from 'lucide-react';
import * as React from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import LabelledInputWrapper from './LabelledInputWrapper';
import CustomTypography from './Typography';

import type { JSX } from "react";

interface IProps {
  size?: 'fill' | 'large' | 'medium' | 'small';
  disabled?: boolean;
  acceptedFileTypes?: Accept;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
}

interface IStyleProps extends IProps {
  filesSelected?: boolean;
  isDragActive?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
}

const Container = styled(Box)<IStyleProps>(({
  theme,
  size,
  disabled,
  errorMessage,
  filesSelected,
  isDragActive,
}) => ({
  backgroundColor: theme.colours.core.grey30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '7px 16px',
  border: `1px solid ${errorMessage ? theme.colours.core.red200 : theme.colours.core.grey50}`,
  borderRadius: '4px',
  transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
  ...(size === 'fill' && {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  }),
  ...(size === 'large' && {
    gap: '4px',
    height: '116px',
    width: '400px',
    flexDirection: 'column',
  }),
  ...(size === 'medium' && {
    padding: '11px 16px',
  }),
  '&:hover': !disabled && !filesSelected && !isDragActive && {
    cursor: 'pointer',
    backgroundColor: theme.colours.core.grey50,
  },
  ...(isDragActive && {
    backgroundColor: theme.colours.core.green10,
    borderColor: theme.colours.core.green100,
  }),
  opacity: disabled ? 0.4 : 1,
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function CustomFileUpload({
  label,
  helperText,
  errorMessage,
  size = 'medium',
  acceptedFileTypes,
  disabled,
  value,
  onChange,
}: IProps): JSX.Element {
  const [files, setFiles] = React.useState<File[]>(value ?? []);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: acceptedFileTypes,
    disabled,
    onDropAccepted: (acceptedFiles) => {
      setFiles([...acceptedFiles]);
      if (onChange) {
        onChange(acceptedFiles);
      }
    },
  });

  return (
    <LabelledInputWrapper
      label={label}
      helperText={helperText}
      errorMessage={errorMessage}
    >
      <Container
        id="custom-file-upload"
        size={size}
        disabled={disabled}
        errorMessage={errorMessage}
        filesSelected={files.length > 0}
        {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
      >
        <Box color={files.length > 0 ? corePalette.green150 : corePalette.grey100} width="24px" height="24px">
          <CloudUpload />
        </Box>
        {files.length > 0 ? (
          <Box display="flex" gap="8px" alignItems="center" maxWidth="100%">
            <CustomTypography variant="titleSmall" fontWeight="medium" color="primary" truncate>
              {files.map((f) => f.name).join(', ')}
            </CustomTypography>
            <IconButton
              sx={{
                padding: '4px',
                width: '24px',
                height: '24px',
                '&:hover': { backgroundColor: corePalette.grey50 },
              }}
              onClick={(): void => setFiles([])}
            >
              <XIcon size="20px" />
            </IconButton>
          </Box>
        ) : (
          <CustomTypography variant="titleSmall" fontWeight="medium" truncate>
            Drag and drop or
            {' '}
            <u style={{ color: corePalette.green150 }}>browse your files</u>
          </CustomTypography>
        )}
        <VisuallyHiddenInput
          disabled={disabled || files.length > 0}
          {...getInputProps()}
        />
      </Container>
    </LabelledInputWrapper>
  );
}
