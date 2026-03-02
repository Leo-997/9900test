import {
  TableCell, TableHead, TableRow,
} from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import CustomTypography from '@/components/Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '44px',
    backgroundColor: '#FAFBFC',
  },
  rowItem: {
    marginRight: '16px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    padding: 0,
  },
  stickyLeft: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
  },
}));

export default function PopupHeader(): JSX.Element {
  const classes = useStyles();

  return (
    <TableHead>
      <TableRow style={{ height: '60px', padding: '0' }}>
        <TableCell className={clsx(classes.rowItem, classes.stickyLeft)} style={{ width: '80px' }} />
        <TableCell className={clsx(classes.rowItem, classes.stickyLeft)} style={{ width: '360px' }}>
          <CustomTypography variant="label">
            PATIENT ID
          </CustomTypography>
        </TableCell>
        <TableCell className={classes.rowItem} style={{ width: '155px' }}>
          <CustomTypography variant="label">
            STATUS
          </CustomTypography>
        </TableCell>
        <TableCell className={classes.rowItem} style={{ width: '150px' }}>
          <CustomTypography variant="label">
            EVENT
          </CustomTypography>
        </TableCell>
        <TableCell className={classes.rowItem} style={{ width: '336px' }}>
          <CustomTypography variant="label">
            DIAGNOSIS
          </CustomTypography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
