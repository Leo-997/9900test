import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, type JSX } from 'react';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  textSection: {
    padding: '8px',
    paddingLeft: 48,
    paddingBottom: '16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface IProps {
  children: ReactNode;
  defaultText?: string;
  loading?: boolean;
}

export default function Header({
  children,
  defaultText = 'No clinically reportable variants',
  loading = false,
}: IProps): JSX.Element {
  const classes = useStyles();

  const getContent = (): ReactNode => {
    if (loading) {
      return <div />;
    }

    if (children) {
      return children;
    }

    return <CustomTypography variant="bodyRegular">{defaultText}</CustomTypography>;
  };

  return (
    <Box className={classes.textSection}>
      {getContent()}
    </Box>
  );
}
