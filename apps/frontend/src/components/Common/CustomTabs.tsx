import { Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useState, type JSX } from 'react';
import { ISelectOption } from '../../types/misc.types';
import CustomTypography from './Typography';

const useStyles = makeStyles(() => ({
  tabs: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiTabs-indicator': {
      top: 0,
      height: '4px',
      backgroundColor: '#5DFCA8',
      transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
    },
  },
  tabRoot: {
    opacity: 1,
    transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
  },
  tabSelected: {
    backgroundColor: '#FAFBFC',
  },
}));

interface IProps<T extends string | number> {
  defaultTab?: ISelectOption<T>;
  tabs: ISelectOption<T>[];
  onChange?: (value: T) => void;
}

export default function CustomTabs<T extends string | number>({
  defaultTab,
  tabs,
  onChange,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState<ISelectOption<T> | undefined>(
    defaultTab || tabs[0],
  );

  return (
    <Tabs
      className={classes.tabs}
      value={selectedTab?.value || false}
      onChange={(e, v: T): void => {
        setSelectedTab(tabs.find((tab) => tab.value === v));
        if (onChange) {
          onChange(v);
        }
      }}
    >
      {tabs.map((tab) => (
        <Tab
          disableRipple
          className={clsx({
            [classes.tabRoot]: true,
            [classes.tabSelected]: selectedTab?.value === tab.value,
          })}
          key={`tab-value-${tab.value}`}
          label={(
            <CustomTypography
              style={{ textTransform: 'none', color: '#030313' }}
              fontWeight={selectedTab?.value === tab.value ? 'bold' : 'regular'}
            >
              {tab.name}
            </CustomTypography>
          )}
          value={tab.value}
        />
      ))}
    </Tabs>
  );
}
