import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import {
  Tab as MuiTab,
  Tabs as MuiTabs,
  SxProps,
  TabProps,
  TabsProps,
  Tooltip,
} from '@mui/material';
import { useState, type JSX } from 'react';

type TabVariant = 'alpha-hopper';
type TabSize = 'small' | 'medium' | 'large';
type IndicatorLocation = 'top' | 'bottom';
type Mode = 'light' | 'dark';
type Direction = 'column' | 'row';

interface ITabCount extends TabProps {
  count: number,
}

interface IProps extends Omit<TabsProps, 'variant'> {
  variant: TabVariant;
  tabs: ITabCount[];
  tabProps?: TabProps;
  size?: TabSize;
  indicatorLocation?: IndicatorLocation;
  tabGap?: string | number;
  mode?: Mode;
  fullWidth?: boolean;
  direction?: Direction;
}

export function AlphaTabs({
  variant,
  tabs,
  tabProps,
  size = 'medium',
  indicatorLocation = 'top',
  tabGap,
  fullWidth = false,
  direction = 'row',
  ...props
}: IProps): JSX.Element {
  const [tabValue, setTabValue] = useState<number>(0);

  const getSizeStyles = (): SxProps => {
    switch (size) {
      case 'small':
        return {
          height: '32px',
          minHeight: '32px',
        };
      case 'medium':
        return {
          height: '48px',
          minHeight: '48px',
        };
      case 'large':
      default:
        return {
          height: '64px',
          minHeight: '64px',
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
        color: `${corePalette.grey50}`,
      },
    };

    if (variant === 'alpha-hopper') {
      return {
        ...commonStyles,
        borderRadius: '0.5vw',
        width: '28px',
        height: '28px',
        backgroundColor: corePalette.blank,
        color: corePalette.grey100,
        padding: '0.5vw',
        fontSize: '12px',
        '&:hover': {
          backgroundColor: `${corePalette.grey50} !important`,
          fontSize: '16px',
          color: `${corePalette.green300}`,
          fontWeight: 'bold',
          '&.Mui-selected': {
            backgroundColor: `${corePalette.green30} !important`,
          },
        },
        '&.Mui-selected': {
          backgroundColor: `${corePalette.green10}`,
          color: `${corePalette.green300}`,
          fontSize: '16px',
          fontWeight: 'bold',
        },
      };
    }
    return commonStyles;
  };

  const getTabsStyles = (): SxProps => {
    const commonStyles: SxProps = {
      minHeight: 0,
      '& .MuiTabs-flexContainer': {
        gap: tabGap,
        flexDirection: direction,
      },
    };

    switch (variant) {
      case 'alpha-hopper':
        return {
          ...commonStyles,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        };
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
      sx={getTabsStyles()}
      {...props}
    >
      {tabs.map((tab) => (
        <Tooltip
          title={`${tab.count} Gene${tab.count === 1 ? '' : 's'}`}
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: corePalette.white,
                color: corePalette.offBlack200,
                fontSize: '13px',
                verticalAlign: 'middle',
                padding: '8px 16px',
                boxShadow: `0px 10px 40px ${corePalette.grey50}`,
              },
            },
          }}
        >
          <MuiTab
            key={tab.value}
            value={tab.value}
            label={(
              <CustomTypography variant="bodyRegular" truncate>
                {tab.label}
              </CustomTypography>
            )}
            sx={
              {
                ...getSizeStyles(),
                ...getVariantStyles(),
              } as SxProps
            }
            disabled={tab.count === 0}
            {...tab}
            {...tabProps}
          />
        </Tooltip>
      ))}
    </MuiTabs>
  );
}
