import { Box } from '@mui/material';
import { CSSProperties, ReactNode, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';

const useStyles = makeStyles(() => ({
  item: {
    height: '48px',
    paddingLeft: '8px',
    borderLeft: '1px solid #D0D9E2',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
}));

interface IProps {
  title: string,
  value: ReactNode,
  style?: CSSProperties,
}

export default function TextPreviewField({
  title,
  value,
  style,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      style={style}
    >
      <CustomTypography variant="label" style={{ marginBottom: '8px' }}>
        {title}
      </CustomTypography>
      <Box className={classes.item}>
        <CustomTypography truncate variant="bodyRegular" fontWeight="medium">
          {value}
        </CustomTypography>
      </Box>
    </Box>
  );
}
