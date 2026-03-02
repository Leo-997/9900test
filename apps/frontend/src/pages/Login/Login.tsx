import { useMsal } from '@azure/msal-react';
import { Grid } from '@mui/material';

import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import CustomTypography from '../../components/Common/Typography';
import ZeroLogoIcon from '../../components/CustomIcons/ZeroLogo';

import CustomButton from '../../components/Common/Button';
import { loginRequest } from '../../utils/config/authConfig';
import updateTabTitle from '../../utils/functions/updateTabTitle';
import { LoginPageLayout } from './Layout';

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

export default function LoginPage(): JSX.Element {
  const classes = useStyles();
  const { instance } = useMsal();
  const location = useLocation();

  const [loginBtnDisabled, setLoginBtnDisabled] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    setLoginBtnDisabled(true);
    try {
      await instance.loginRedirect({
        ...loginRequest,
        redirectStartPage: location?.state?.from?.pathname ?? '/',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoginBtnDisabled(false);
    }
  };

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
        <Grid style={{ minWidth: '500px', width: '500px', zIndex: 50 }}>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
          >
            <Grid>
              <div className={classes.headerText}>
                We are curing childhood cancer.
                <br />
                It&apos;s not if. It&apos;s
                {' '}
                <b>when.</b>
              </div>
              <div>
                <CustomTypography variant="titleRegular" style={{ marginBottom: '1em' }}>
                  Login with your CCIA credentials
                </CustomTypography>
              </div>
              <div>
                <CustomButton
                  style={{ width: '70%' }}
                  variant="bold"
                  size="medium"
                  disabled={loginBtnDisabled}
                  label="Login with CCIA"
                  onClick={handleLogin}
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LoginPageLayout>
  );
}
