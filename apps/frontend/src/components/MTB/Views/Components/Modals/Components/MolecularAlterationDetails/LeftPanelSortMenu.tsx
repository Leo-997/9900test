import {
  MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#022034',
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
  },
  radio: {
    visibility: 'hidden',
    width: '0',
    height: '0',
  },
  sortIcon: {
    width: '24px',
    height: '24px',
  },
}));

interface IProps {
  onChange: (value: string) => void;
}

export default function LeftPanelSortMenu({
  onChange,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <MenuItem
        className={classes.menuItem}
        onClick={(): void => onChange('MTB Meeting:asc')}
      >
        Earliest meeting date
      </MenuItem>
      <MenuItem
        className={classes.menuItem}
        onClick={(): void => onChange('MTB Meeting:desc')}
      >
        Latest meeting date
      </MenuItem>
    </>
  );
}
