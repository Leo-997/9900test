/* eslint-disable @typescript-eslint/naming-convention */
import { createTheme, darken, lighten } from '@mui/material';
import SwitchCheckedIcon from '@/components/CustomIcons/SwitchCheckedIcon';
import SwitchUncheckedIcon from '@/components/CustomIcons/SwitchUnckeckedIcon';
import { IChipColours, ICorePalette, ISignificanceColours } from '@/types/theme.types';
import convertSVGToDataURI from '@/utils/misc/dataURI';
import type { } from '@mui/x-data-grid/themeAugmentation';
import { chipColours, corePalette, significanceColours } from './colours';

declare module '@mui/material/styles' {
  interface Theme {
    colours: {
      core: ICorePalette;
      chips: IChipColours;
      significance: ISignificanceColours;
    };
  }

  interface ThemeOptions {
    colours: {
      core: ICorePalette;
      chips: IChipColours;
      significance: ISignificanceColours;
    };
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    titleRegular: React.CSSProperties;
    titleSmall: React.CSSProperties;
    label: React.CSSProperties;
    bodyRegular: React.CSSProperties;
    bodySmall: React.CSSProperties;
    bodyTiny: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    titleRegular?: React.CSSProperties;
    titleSmall?: React.CSSProperties;
    label?: React.CSSProperties;
    bodyRegular?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
    bodyTiny?: React.CSSProperties;
  }
}

declare module '@mui/material/Switch' {
  interface SwitchPropsColorOverrides {
    red: true;
    green: true;
    blue: true;
    orange: true;
    primary: undefined;
    secondary: undefined;
    error: undefined;
    info: undefined;
    success: undefined;
    warning: undefined;
    default: undefined;
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    primary: undefined;
    secondary: undefined;
    error: undefined;
    info: undefined;
    success: undefined;
    warning: undefined;
    default: undefined;
  }

  interface CheckboxPropsSizeOverrides {
    small: undefined;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    titleRegular: true;
    titleSmall: true;
    label: true;
    bodyRegular: true;
    bodySmall: true;
    bodyTiny: true;
    body1: undefined;
    body2: undefined;
    overline: undefined;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    bold: true;
    outline: true;
    subtle: true;
    text: true;
    warning: true;
    outlined: undefined;
    contained: undefined;
  }

  interface ButtonPropsSizeOverrides {
    large: undefined;
  }
}

declare module '@mui/material/Avatar' {
  // interface AvatarPropsOverrides {
  //   size: true;
  // }
}

declare module '@mui/material/Chip' {
  interface ChipClasses {
    sizeLarge: string;
  }

  interface ChipPropsSizeOverrides {
    small: true;
    medium: true;
    large: true;
  }
}

export const zccTheme = createTheme({
  colours: {
    core: corePalette,
    chips: chipColours,
    significance: significanceColours,
  },
  typography: {
    fontFamily: 'Roboto',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '3rem',
      color: corePalette.offBlack100,
    },
    h2: {
      fontSize: '2.125rem',
      color: corePalette.offBlack100,
    },
    h3: {
      fontSize: '1.5rem',
      color: corePalette.offBlack100,
    },
    titleRegular: {
      fontSize: '1.25rem',
      color: corePalette.offBlack100,
    },
    titleSmall: {
      fontSize: '1rem',
      color: corePalette.offBlack100,
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.784px',
      textTransform: 'uppercase',
      color: corePalette.offBlack100,
    },
    bodyRegular: {
      fontSize: '1rem',
      color: corePalette.offBlack100,
      lineHeight: '150%',
      letterSpacing: '2%',
    },
    bodySmall: {
      fontSize: '0.875rem',
      color: corePalette.offBlack100,
      lineHeight: '140%',
      letterSpacing: '1%',
    },
    bodyTiny: {
      fontSize: '0.75rem',
      color: corePalette.offBlack100,
      lineHeight: '130%',
      letterSpacing: '0%',
    },
  },
  palette: {
    primary: {
      main: corePalette.green150,
    },
    text: {
      primary: corePalette.offBlack100,
    },
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        arrow: false,
        leaveDelay: 100,
        slotProps: {
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 5],
                },
              },
            ],
          },
        },
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: corePalette.grey10,
          color: corePalette.offBlack100,
          fontSize: '14px',
          verticalAlign: 'middle',
          boxShadow: `0px 4px 16px ${corePalette.offBlack200}22`,
          margin: '0px !important',
        },
        arrow: {
          color: corePalette.grey10,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        density: 'compact',
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: `1px solid ${corePalette.grey50}`,
        },
        cell: {
          '&:focus': {
            outline: 'none',
          },
        },
        columnHeader: {
          '&:focus': {
            outline: 'none',
          },
          '&:focus-within': {
            outline: 'none',
          },
        },
        iconButtonContainer: {
          '& button': {
            width: '24px',
            height: '24px',
          },
        },
        menuIconButton: {
          width: '24px',
          height: '24px',
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          gap: '8px',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0,
          gap: '8px',
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: 0,
          width: '18px',
          height: '18px',
          color: corePalette.grey200,
          transition: 'all 0.7s cubic-bezier(0.19, 1, 0.22, 1)',
          '&:hover': {
            color: corePalette.offBlack200,
          },
          '&.Mui-checked': {
            color: corePalette.green150,
            '&:hover': {
              color: corePalette.green200,
            },
          },
          '&.MuiCheckbox-indeterminate': {
            color: corePalette.grey100,
            '&:hover': {
              color: corePalette.grey200,
            },
          },
          '&.Mui-disabled': {
            color: corePalette.grey50,
          },
        },
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: 'green',
      },
      styleOverrides: {
        root: {
          width: '32px',
          height: '20px',
          padding: 0,
        },
        switchBase: {
          padding: 0,
          top: '3px',
          left: '3px',
          color: corePalette.white,
          '&.Mui-checked': {
            color: corePalette.white,
            transform: 'translateX(12px)',
            '&+.MuiSwitch-track': {
              backgroundColor: corePalette.green150,
              opacity: 1,
            },
            '&.Mui-disabled': {
              color: corePalette.grey10,
            },
          },
          '&.Mui-disabled': {
            color: corePalette.grey10,
            '&+.MuiSwitch-track': {
              backgroundColor: `${corePalette.grey50} !important`,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: '14px',
          height: '14px',
          boxShadow: 'none',
        },
        track: {
          borderRadius: '10px',
          backgroundColor: corePalette.grey100,
          opacity: 1,

          // Custom switch icons
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            top: '10px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          },
          '&:before': {
            backgroundImage: convertSVGToDataURI(SwitchCheckedIcon({})),
            left: '1px',
          },
          '&:after': {
            backgroundImage: convertSVGToDataURI(SwitchUncheckedIcon({})),
            right: '1px',
          },
        },
      },
      variants: [
        {
          props: { color: 'red' },
          style: {
            '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
              backgroundColor: corePalette.red100,
              opacity: 1,
            },
            '& .MuiSwitch-switchBase.Mui-disabled': {
              color: corePalette.grey10,
              '&+.MuiSwitch-track': {
                backgroundColor: `${corePalette.grey50} !important`,
                opacity: 1,
              },
            },
          },
        },
        {
          props: { color: 'green' },
          style: {
            '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
              backgroundColor: corePalette.green150,
              opacity: 1,
              '& .MuiSwitch-switchBase.Mui-disabled': {
                color: corePalette.grey10,
                '&+.MuiSwitch-track': {
                  backgroundColor: `${corePalette.grey50} !important`,
                  opacity: 1,
                },
              },
            },
          },
        },
        {
          props: { color: 'blue' },
          style: {
            '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
              backgroundColor: corePalette.blue100,
              opacity: 1,
            },
            '& .MuiSwitch-switchBase.Mui-disabled': {
              color: corePalette.grey10,
              '&+.MuiSwitch-track': {
                backgroundColor: `${corePalette.grey50} !important`,
                opacity: 1,
              },
            },
          },
        },
        {
          props: { color: 'orange' },
          style: {
            '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
              backgroundColor: corePalette.orange100,
              opacity: 1,
            },
            '& .MuiSwitch-switchBase.Mui-disabled': {
              color: corePalette.grey10,
              '&+.MuiSwitch-track': {
                backgroundColor: `${corePalette.grey50} !important`,
                opacity: 1,
              },
            },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          gap: '4px',
          '& .MuiChip-label': {
            padding: '2px 6px !important',
          },
        },
        sizeSmall: {
          height: '24px',
        },
        sizeMedium: {
          height: '28px',
        },
        sizeLarge: {
          height: '36px',
          borderRadius: '18px',
          padding: '4px 12px !important',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          border: `1px solid ${corePalette.grey50}`,
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'bold' },
          style: {
            color: corePalette.offBlack100,
            backgroundColor: corePalette.yellow100,
            '&:hover': {
              backgroundColor: lighten(corePalette.yellow150, 0.05),
            },
            '&:active': {
              backgroundColor: corePalette.yellow150,
            },
            '&:focus': {
              outline: `3px solid ${corePalette.yellow30}`,
              transition: 'none',
            },
            '&:disabled': {
              color: lighten(corePalette.offBlack200, 0.65),
              backgroundColor: lighten(corePalette.yellow30, 0.19),
            },
          },
        },
        {
          props: { variant: 'outline' },
          style: {
            border: `1px solid ${corePalette.green150}`,
            color: corePalette.green150,
            '&:hover': {
              border: `1px solid ${corePalette.green200}`,
              color: corePalette.green200,
              backgroundColor: corePalette.blank,
            },
            '&:active': {
              border: `1px solid ${corePalette.green200}`,
              color: corePalette.green200,
            },
            '&:focus': {
              outline: `2px solid ${corePalette.green150}`,
            },
            '&:disabled': {
              border: `1px solid ${corePalette.grey50}`,
              color: corePalette.grey50,
            },
          },
        },
        {
          props: { variant: 'subtle' },
          style: {
            backgroundColor: corePalette.grey30,
            '&:hover': {
              backgroundColor: corePalette.grey50,
            },
            '&:active': {
              backgroundColor: darken(corePalette.grey50, 0.13),
            },
            '&:focus': {
              outline: `3px solid ${darken(corePalette.grey50, 0.13)}`,
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            color: corePalette.green150,
            '&:hover': {
              backgroundColor: corePalette.grey30,
            },
            '&:active': {
              backgroundColor: corePalette.green10,
              color: corePalette.green300,
            },
            '&:focus': {
              outline: `3px solid ${corePalette.green100}`,
              color: corePalette.green300,
            },
          },
        },
        {
          props: { variant: 'warning' },
          style: {
            border: `1px solid ${corePalette.red200}`,
            color: corePalette.red200,
            '&:hover': {
              border: `1px solid ${corePalette.red300}`,
              color: corePalette.red300,
              backgroundColor: corePalette.blank,
            },
            '&:active': {
              border: `1px solid ${corePalette.red300}`,
              color: corePalette.red50,
            },
            '&:focus': {
              outline: `3px solid ${corePalette.red200}`,
              color: corePalette.red300,
            },
            '&:disabled': {
              border: `1px solid ${darken(corePalette.grey50, 0.01)}`,
              color: `${lighten(corePalette.grey50, 0.05)}`,
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          minWidth: 'unset',
          padding: '0 16px',
          borderRadius: '50px',
          '& .MuiBox-root': {
            textTransform: 'none',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          },
        },
        sizeSmall: {
          height: '32px',
          '& .MuiBox-root': {
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '0.25px',
          },
        },
        sizeMedium: {
          height: '48px',
          '& .MuiBox-root': {
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.5px',
          },
        },
      },
      defaultProps: {
        variant: 'bold',
        size: 'medium',
        disableFocusRipple: true,
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          height: '40px',
        },
        inputRoot: {
          height: '40px',
          padding: '0px',
        },
        input: {
          marginLeft: '10px',
        },
        popper: {
          '& .MuiPaper-root': {
            boxShadow: `0px 4px 16px ${corePalette.grey200}24`,
          },
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          alignItems: 'flex-start',
          padding: '8px 12px',
          color: corePalette.offBlack100,
          backgroundColor: corePalette.white,
          // Below code is to customise fieldset/notchedOutline
          // borders (MuiOutlinedInput-notchedOutline)
          // Any update to borders should be made there,
          // not to root's borders otherwise 2 borders are added
          '&.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: corePalette.red150,
            },
          },
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: corePalette.grey50,
            },
          },
          '&:hover.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: corePalette.red150,
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              border: `2px solid ${corePalette.green100}`,
            },
          },
          '&.Mui-focused.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              border: `1px solid ${corePalette.red150}`,
            },
          },
        },
        input: {
          padding: 0,
          border: 'none',
          '&::placeholder': {
            color: corePalette.grey200,
          },
        },
        sizeSmall: {
          height: 40,
          padding: '8px 12px 8px 16px',
        },
        multiline: {
          height: 'auto',
          alignItems: 'start',
        },
        adornedEnd: {
          '&.Mui-error': {
            color: corePalette.red150,
          },
          '& > svg:last-of-type': {
            marginLeft: '8px',
          },
        },
        adornedStart: {
          display: 'flex',
          alignItems: 'center',
          '& > svg:first-of-type': {
            marginRight: '8px',
          },
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        square: true,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: corePalette.blank,
          borderBottom: 'none',
          '&:before': {
            display: 'none', // To remove the default top border and prevent double-up
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            margin: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            order: -1, // Put the expand icon to the left, before the title
            marginRight: '12px',
            '& > svg': {
              color: corePalette.offBlack100,
            },
          },
        },
      },
    },
    MuiAccordionActions: {
      styleOverrides: {
        spacing: {
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          '& .MuiBadge-badge': {
            right: '5px',
            bottom: '5px',
            transform: 'scale(1) translate(50%, 50%)',
            transformOrigin: '100% 100%',
          },
        },
      },
      defaultProps: {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableFocusRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: corePalette.offBlack100,
          '&:focus': {
            outline: 'none',
          },
          '&:hover': {
            backgroundColor: corePalette.grey30,
          },
        },
        sizeLarge: {
          width: '40px',
          height: '40px',
        },
        sizeMedium: {
          width: '36px',
          height: '36px',
        },
        sizeSmall: {
          width: '32px',
          height: '32px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          maxWidth: 'calc(100vw - 64px)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 32px 16px 32px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 !important',
          margin: '16px 32px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 32px 24px 32px',
          gap: '16px',
          '&>:not(:first-of-type)': {
            marginLeft: '0',
          },
        },
      },
    },
  },
});
