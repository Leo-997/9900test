import { corePalette } from '@/themes/colours';
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  Checkbox,
  ChipTypeMap,
  MenuItem,
  Popper as MuiPopper,
  SxProps,
  TextField,
  Theme,
  styled,
} from '@mui/material';
import CustomChip from './Chip';
import LabelledInputWrapper from './LabelledInputWrapper';
import CustomTypography from './Typography';

import type { JSX } from "react";

interface IProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> extends Omit<AutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>, 'renderInput'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  inputPlaceholder?: string;
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
  wrapperSx?: SxProps<Theme>;
}

const Popper = styled(MuiPopper)(({ disablePortal }) => ({
  '&.MuiAutocomplete-popperDisablePortal': {
    position: disablePortal ? 'relative !important' : undefined,
    transform: disablePortal ? 'none !important' : undefined,
    '& .MuiPaper-root': {
      boxShadow: 'none',
    },
  },
}));

export default function CustomAutocomplete<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>({
  label,
  helperText,
  errorMessage,
  inputPlaceholder,
  renderInput,
  wrapperSx,
  renderOption,
  multiple,
  getOptionLabel,
  fullWidth,
  disabled,
  ...rest
}: IProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>): JSX.Element {
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
      <Autocomplete
        sx={{
          height: 'auto',
          minHeight: '40px',
          '& .MuiAutocomplete-inputRoot': {
            height: 'auto',
            minHeight: '40px',
            '& .MuiBox-root': {
              maxHeight: '100px',
              overflowY: 'auto',
            },
          },
        }}
        slots={{
          popper: Popper,
        }}
        renderInput={renderInput || (
          (params): JSX.Element => <TextField {...params} variant="outlined" placeholder={inputPlaceholder} />
        )}
        renderOption={renderOption || ((props, option, { selected }): JSX.Element => (
          <MenuItem
            {...props}
            disabled={disabled}
            sx={{ gap: '8px' }}
          >
            {multiple && (
              <Checkbox
                checked={selected}
                disabled={disabled}
              />
            )}
            <CustomTypography truncate>
              {getOptionLabel ? getOptionLabel(option) : option as string}
            </CustomTypography>
          </MenuItem>
        ))}
        renderTags={(value, getTagProps): JSX.Element => (
          <>
            {value.map((v, index) => (
              <CustomChip
                pill
                size="small"
                label={getOptionLabel ? getOptionLabel(v) : v as string}
                backgroundColour={corePalette.green10}
                colour={corePalette.green200}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    color: `${corePalette.green300} !important`,
                  },
                }}
                {...getTagProps({ index })}
              />
            ))}
          </>
        )}
        multiple={multiple}
        getOptionLabel={getOptionLabel}
        fullWidth={fullWidth}
        disabled={disabled}
        {...rest}
      />
    </LabelledInputWrapper>
  );
}
