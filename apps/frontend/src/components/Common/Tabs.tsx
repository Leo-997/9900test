import { corePalette } from '@/themes/colours';
import {
  Tab as MuiTab,
  Tabs as MuiTabs,
  SxProps,
  TabProps,
  tabsClasses,
  TabsProps,
  Theme,
} from '@mui/material';
import { useState, type JSX } from 'react';
import CustomTypography from './Typography';

type TabVariant = 'navigation' | 'sub-navigation' | 'rectangle' | 'pill';
type TabSize = 'small' | 'medium' | 'large' | 'xlarge';
type IndicatorLocation = 'top' | 'bottom';
type Mode = 'light' | 'dark';
type Direction = 'column' | 'row';

interface IProps extends Omit<TabsProps, 'variant'> {
  variant: TabVariant;
  tabs: TabProps[];
  tabProps?: TabProps;
  size?: TabSize;
  indicatorLocation?: IndicatorLocation;
  tabGap?: string | number;
  mode?: Mode; // Currently affects 'navigation' variant only
  fullWidth?: boolean;
  direction?: Direction;
}

export function CustomTabs({
  variant,
  tabs,
  tabProps,
  size = 'medium',
  indicatorLocation = 'top',
  tabGap,
  mode = 'light',
  fullWidth = false,
  direction = 'row',
  sx,
  ...props
}: IProps): JSX.Element {
  const [tabValue, setTabValue] = useState<number>(0);

  const getSizeStyles = (): SxProps => {
    switch (size) {
      case 'small':
        return {
          height: '32px',
          minHeight: '32px',
          paddingTop: '7px',
          paddingBottom: '7px',
        };
      case 'medium':
        return {
          height: '48px',
          minHeight: '48px',
          paddingTop: '15px',
          paddingBottom: '15px',
        };
      case 'xlarge':
        return {
          height: '80px',
          minHeight: '80px',
          paddingTop: '30px',
          paddingBottom: '30px',
        };
      case 'large':
      default:
        return {
          height: '64px',
          minHeight: '64px',
          paddingTop: '22px',
          paddingBottom: '22px',
        };
    }
  };

  const getVariantStyles = (): SxProps => {
    const commonStyles: SxProps = {
      maxWidth: '100%',
      minWidth: 0,
      textTransform: 'none',
      flexGrow: fullWidth ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
      '&.Mui-disabled': {
        color: `${corePalette.grey100}`,
      },
    };

    if (variant === 'rectangle') {
      return {
        ...commonStyles,
        backgroundColor: corePalette.grey10,
        color: corePalette.offBlack100,
        '&:hover': {
          backgroundColor: `${corePalette.grey30} !important`,
          '&.Mui-selected': {
            backgroundColor: `${corePalette.green30} !important`,
          },
        },
        '&.Mui-selected': {
          backgroundColor: `${corePalette.green10}`,
          color: `${corePalette.green300}`,
        },
      };
    }

    if (variant === 'pill') {
      return {
        ...commonStyles,
        borderRadius: '50px',
        backgroundColor: corePalette.blank,
        color: corePalette.offBlack100,
        '&:hover': {
          backgroundColor: `${corePalette.grey50} !important`,
          '&.Mui-selected': {
            backgroundColor: `${corePalette.green30} !important`,
          },
        },
        '&.Mui-selected': {
          backgroundColor: `${corePalette.green10}`,
          color: `${corePalette.green300}`,
        },
      };
    }

    if (variant === 'sub-navigation') {
      return {
        ...commonStyles,
        backgroundColor: corePalette.grey10,
        color: corePalette.offBlack100,
        borderBottom: `1px solid ${corePalette.grey50}`,
        borderLeft: `0.5px solid ${corePalette.grey50}`,
        borderRight: `0.5px solid ${corePalette.grey50}`,
        '&:hover': {
          backgroundColor: `${corePalette.grey30} !important`,
          '&.Mui-selected': {
            backgroundColor: `${corePalette.green30} !important`,
          },
        },
        '&.Mui-selected': {
          backgroundColor: `${corePalette.green10}`,
          color: `${corePalette.offBlack100}`,
        },
      };
    }

    // Specific styles for navigation variant in light/dark mode
    switch (mode) {
      case 'dark':
        return {
          ...commonStyles,
          color: corePalette.grey10,
          '&:hover': {
            backgroundColor: `${corePalette.grey200} !important`,
            '&.Mui-selected': {
              backgroundColor: `${corePalette.grey30} !important`,
            },
          },
          '&.Mui-selected': {
            backgroundColor: `${corePalette.grey10}`,
            color: `${corePalette.offBlack100}`,
          },
        };
      case 'light':
      default:
        return {
          ...commonStyles,
          backgroundColor: corePalette.blank,
          color: corePalette.offBlack100,
          '&:hover': {
            backgroundColor: `${corePalette.grey30} !important`,
          },
          '&.Mui-selected': {
            color: `${corePalette.green200}`,
          },
        };
    }
  };

  const getTabsStyles = (): SxProps<Theme> => {
    const commonStyles: SxProps = {
      minHeight: 0,
      '& .MuiTabs-flexContainer': {
        gap: tabGap,
        flexDirection: direction,
      },
      [`& .${tabsClasses.scrollButtons}`]: {
        '&.Mui-disabled': { opacity: 0.3 },
      },
    };

    switch (variant) {
      case 'rectangle':
        return {
          ...commonStyles,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTabs-flexContainer > button': {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          },
        };
      case 'pill':
        return {
          ...commonStyles,
          '& .MuiTabs-indicator': {
            display: 'none',
            visibility: 'hidden',
          },
        };
      case 'navigation':
      case 'sub-navigation':
      default:
        return {
          ...commonStyles,
          '& .MuiTabs-indicator': {
            backgroundColor: corePalette.green100,
            height: '4px',
            bottom: indicatorLocation === 'bottom' ? 0 : undefined,
            top: indicatorLocation === 'top' ? 0 : undefined,
          },
        };
    }
  };

  return (
    <MuiTabs
      value={tabValue}
      onChange={(e, v): void => setTabValue(v)}
      sx={{ ...getTabsStyles(), ...sx } as SxProps}
      variant={props.scrollButtons ? 'scrollable' : undefined}
      {...props}
    >
      {tabs.map((tab) => (
        <MuiTab
          key={tab.value}
          value={tab.value}
          sx={
            {
              ...getSizeStyles(),
              ...getVariantStyles(),
            } as SxProps
          }
          {...tab}
          {...tabProps}
          label={(
            <CustomTypography
              variant={size.includes('large') ? 'bodyRegular' : 'bodySmall'}
              truncate
              color="inherit"
              sx={{
                overflow: 'unset',
              }}
            >
              {tab.label}
            </CustomTypography>
          )}
        />
      ))}
    </MuiTabs>
  );
}
