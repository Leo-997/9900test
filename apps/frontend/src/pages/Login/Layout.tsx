import { ReactNode, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import { LoginPageBackground } from './Background';

const useStyles = makeStyles(() => ({
  container: {
    height: '100vh',
  },
  leftPanel: {
    float: 'left',
    width: '50%',
    height: '100%',
  },
  rightPanel: {
    float: 'left',
    width: '55%',
    height: '100%',
    minHeight: '100%',
    position: 'fixed',
    left: '45%',
    top: '0',
  },
}));

interface IProps {
  children: ReactNode;
}

export function LoginPageLayout({
  children,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.leftPanel}>
        {children}
      </div>
      <div className={classes.rightPanel}>
        <LoginPageBackground preserveAspectRatio="none" style={{ height: '100%', width: 'auto', float: 'right' }} />
      </div>
    </div>
  );
}
