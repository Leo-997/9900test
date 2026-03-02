import clsx from 'clsx';

import { Box, Button } from '@mui/material';

import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';
import { ISelectOption } from '../../types/misc.types';

import type { JSX } from "react";

const useStyles = makeStyles({
  tabContainer: {
    backgroundColor: '#ECF0F3',
    marginBottom: 34,
    height: 38,
    borderRadius: 4,
    padding: 2,
  },
  tabButton: {
    textTransform: 'none',
    flex: 1,
    color: '#022034',
  },
  tabButtonSelected: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D0D9E2',
  },
});

interface IProps<T = number> {
  values: ISelectOption<T>[];
  activeValue?: T | null;
  onValSelect(val: T): void;
}

export function MultiSwitch<T = number>({
  values,
  activeValue,
  onValSelect,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  return (
    <Box display="flex" width="100%" className={classes.tabContainer}>
      {values.map((val) => (
        <Button
          key={`${val.name}-${val.value}`}
          className={clsx({
            [classes.tabButton]: true,
            [classes.tabButtonSelected]: activeValue === val.value,
          })}
          onClick={(): void => onValSelect(val.value)}
        >
          <CustomTypography>{val.name}</CustomTypography>
        </Button>
      ))}
    </Box>
  );
}
