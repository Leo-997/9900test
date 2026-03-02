import {
  FormControlLabel,
  MenuItem,
  Radio,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#022034',
  },
  radio: {
    visibility: 'hidden',
    width: '0',
    height: '0',
  },
}));

interface IProps {
  onChange: (value: string) => void;
}
export default function ClinicalSortMenu({ onChange }: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <>
      <MenuItem className={classes.menuItem}>
        <FormControlLabel
          onClick={(): void => onChange('MTB Meeting Date:desc')}
          value="MTB Meeting Date:desc"
          control={<Radio className={classes.radio} />}
          label="MTB Meeting Date"
          labelPlacement="end"
        />
        <ArrowDownIcon />
      </MenuItem>
      <MenuItem className={classes.menuItem}>
        <FormControlLabel
          onClick={(): void => onChange('MTB Meeting Date:asc')}
          value="MTB Meeting Date:asc"
          control={<Radio className={classes.radio} />}
          label="MTB Meeting Date"
          labelPlacement="end"
        />
        <ArrowUpIcon />
      </MenuItem>
      <MenuItem className={classes.menuItem}>
        <FormControlLabel
          onClick={(): void => onChange('Enrolment Date:desc')}
          value="Enrolment Date:desc"
          control={<Radio className={classes.radio} />}
          label="Enrolment Date"
          labelPlacement="end"
        />
        <ArrowDownIcon />
      </MenuItem>
      <MenuItem className={classes.menuItem}>
        <FormControlLabel
          onClick={(): void => onChange('Enrolment Date:asc')}
          value="Enrolment Date:asc"
          control={<Radio className={classes.radio} />}
          label="Enrolment Date"
          labelPlacement="end"
        />
        <ArrowUpIcon />
      </MenuItem>
    </>
  );
}
