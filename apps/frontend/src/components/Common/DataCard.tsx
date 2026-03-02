import { ReactNode, type JSX } from 'react';

import { Box } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CustomTypography, { IProps } from './Typography';

type Props = {
  label: string;
  value?: string | number | ReactNode;
  titleProps?: IProps;
  valueProps?: IProps;
};

const useStyles = makeStyles(() => createStyles({
  value: {
    color: '#022034',
  },
  label: {
    marginBottom: 8,
  },
}));

export default function DataCard({
  label,
  value,
  titleProps,
  valueProps,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <CustomTypography variant="label" className={classes.label} {...titleProps}>
        {label}
      </CustomTypography>
      <CustomTypography
        variant="bodyRegular"
        className={classes.value}
        {...valueProps}
      >
        {value && !value?.toString().includes('undefined') ? value : 'N/A'}
      </CustomTypography>
    </Box>
  );
}
