import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import ZeroLogoIcon from '../../components/CustomIcons/ZeroLogo';
import { LoginPageLayout } from './Layout';
import updateTabTitle from '../../utils/functions/updateTabTitle';

const useStyles = makeStyles(() => ({
  loginContainer: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    top: '38px',
    left: '59px',
  },
  headerText: {
    fontFamily: 'Georgia',
    fontSize: '48px',
    lineHeight: '1.13',
    marginBottom: '1em',
  },
  btnRoot: {
    borderRadius: '6px',
    width: '70%',
    textTransform: 'none',
  },
  btnPrimary: {
    background: '#1E86FC',
  },
  btnDisabled: {
    color: '#FFFFFF !important',
    background: '#AEB9C5 !important',
  },
}));

export default function LoginRedirectPage(): JSX.Element {
  const classes = useStyles();

  updateTabTitle();

  return (
    <LoginPageLayout>
      <div className={classes.logoContainer}>
        <ZeroLogoIcon style={{ width: 173, height: 48 }} />
      </div>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        className={classes.loginContainer}
      >
        <Grid style={{ width: '50%' }}>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
          >
            <Grid>
              <div className={classes.headerText}>
                Logging you in...
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LoginPageLayout>
  );
}
