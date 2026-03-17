import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ILeftPanelTableMapper } from '../../../../../../../types/Samples/Sample.types';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    boxSizing: 'border-box',
    padding: '8px 16px',
    gap: '16px',
    width: '568px',
    height: '48px',
    marginTop: '5px',
  },
  headerText: {
    height: '32px',
    textTransform: 'uppercase',
    color: '#62728C',
  },
}));
interface IProps {
  columns: ILeftPanelTableMapper[];
}

export function LeftPanelHeader({
  columns,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      className={classes.root}
    >
      {columns.map(({ label, style, key }) => (
        <CustomTypography
          key={key}
          className={classes.headerText}
          style={style}
          variant="label"
        >
          {label}
        </CustomTypography>
      ))}
    </Box>
  );
}
