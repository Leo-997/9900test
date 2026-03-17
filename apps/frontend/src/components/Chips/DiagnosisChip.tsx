import { Chip, ChipProps } from '@mui/material';
import { makeStyles } from '@mui/styles';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: 'calc(32vw - 200px)',
    color: '#022034',
    borderColor: '#022034',
    borderRadius: 4,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 500,
    marginLeft: 10,
  },
}));

export default function DiagnosisChip(props: ChipProps): JSX.Element {
  const classes = useStyles();
  return (
    <Chip className={classes.root} {...props} />
  );
}
