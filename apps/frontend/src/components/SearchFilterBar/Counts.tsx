import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  text: {
    margin: '0 24px 0 16px !important',
    whiteSpace: 'nowrap',
  },
}));

interface IProps {
  counts: { current: number, total: number };
  isCompressed?: boolean;
}

export default function Counts({
  counts,
  isCompressed = false,
}: IProps): JSX.Element {
  const classes = useStyles({ isCompressed });

  return (
    <CustomTypography
      variant="label"
      className={classes.text}
    >
      {counts?.current || 0}
      {' '}
      of
      {' '}
      {counts?.total || 0}
      {' '}
      {!isCompressed ? 'rows ' : ''}
      loaded
    </CustomTypography>
  );
}
