import {
  Divider,
  Grid,
  Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { LogOutIcon } from 'lucide-react';
import React, { SetStateAction, type JSX } from 'react';
import { useUser } from '../../contexts/UserContext';
import { CustomAvatar } from '../Common/Avatar';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';

const useStyles = makeStyles(() => ({
  email: {
    color: '#5E6871',
    marginBottom: '15px',
  },
  divider: {
    width: '100%',
    height: '1px',
    marginBottom: '15px',
  },
  menu: {

    '& > ul > li': {
      height: '48px',
    },
  },
  notificationsIcon: {
    marginRight: 10,
  },
}));

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: React.Dispatch<SetStateAction<HTMLElement | null>>;
}

function Settings({
  anchorEl,
  setAnchorEl,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { currentUser } = useUser();

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      disableRestoreFocus
      PaperProps={{
        style: {
          width: '340px',
          height: 'fit-content',
          padding: '32px',
          borderRadius: '24px',
        },
      }}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="16px"
      >
        <Grid>
          <CustomAvatar
            user={currentUser}
            size="huge"
          />
        </Grid>
        <Grid>
          <CustomTypography variant="titleRegular">
            {currentUser?.givenName}
            {' '}
            {currentUser?.familyName}
          </CustomTypography>
        </Grid>
        <Grid>
          <CustomTypography variant="bodySmall" className={classes.email}>{currentUser?.email}</CustomTypography>
        </Grid>
        <Grid style={{ width: '100%' }}>
          <Divider />
        </Grid>
        <Grid>
          {/* Settings go here */}
          <CustomTypography>
            Your profile settings will appear here.
          </CustomTypography>
        </Grid>
        <Grid style={{ width: '100%' }}>
          <Divider className={classes.divider} />
        </Grid>
        <Grid>
          <CustomButton
            variant="warning"
            size="small"
            label="Sign out"
            startIcon={<LogOutIcon />}
          />
        </Grid>
      </Grid>
    </Popover>
  );
}

export default Settings;
