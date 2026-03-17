import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Toolbar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CalendarIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CustomTabs } from '@/components/Common/Tabs';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import ZeroLogoWithRec from '@/components/CustomIcons/ZeroLogoWithRec';
import { Notifications } from '@/components/Notifications/Notifications';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ErrorPage } from '@/pages/Error/ErrorPage';
import { corePalette } from '@/themes/colours';
import updateTabTitle from '@/utils/functions/updateTabTitle';
import { MeetingsDropdown } from '../components/MeetingsDropdown/MeetingsDropdown';
import Settings from '../components/Settings/Settings';
import { useUser } from '../contexts/UserContext';

const useStyles = makeStyles(() => ({
  topBar: {
    height: '80px',
    width: '100vw',
    backgroundColor: corePalette.offBlack200,
    boxShadow: 'none',
  },
  btnText: {
    fontSize: '16px',
    height: 24,
    textTransform: 'none',
    color: '#A9A9A9',
    fontWeight: 'normal',
  },
  btnTextSelected: {
    fontWeight: 'bold !important' as 'bold',
    color: '#ffffff !important',
  },
  btn: {
    width: '160px',
    height: '64px',
    borderRadius: '0px',
  },
  btnSelected: {
    backgroundColor: '#030313',
    borderBottom: '3px solid #F8CA19',
    boxSizing: 'border-box',
  },
  icon: {
    width: '28px',
    height: '28px',
  },
}));

export default function DashboardLayout(): JSX.Element {
  const classes = useStyles();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(null);
  const [anchorElMeetings, setAnchorElMeetings] = useState<HTMLElement | null>(null);

  const canReadReports = useIsUserAuthorised('report.read');
  const canReadCuration = useIsUserAuthorised('curation.sample.read');
  const canReadClinical = useIsUserAuthorised('clinical.sample.read');
  const canReadAtlas = useIsUserAuthorised('atlas.read');

  const canAccessAllStages = canReadReports && canReadCuration && canReadClinical;

  const handleChangeTab = (
    e: React.SyntheticEvent,
    newPage: string,
  ): void => {
    if (newPage === '/meeting') {
      e.preventDefault();
      return;
    }

    let resolvedPage = `/${newPage}`;

    if (newPage === '/dashboard') {
      resolvedPage = canAccessAllStages ? '/overview' : '/curation';
    }

    navigate(resolvedPage);
  };

  updateTabTitle();

  const splitPathname = pathname.split('/')[1];
  let page = splitPathname === 'dashboard' ? '' : splitPathname;
  page = page || (canAccessAllStages ? 'overview' : 'curation');
  const isUntabbedPage = ['meeting', 'comparison'].includes(page);

  if (
    (page === 'overview' && !canReadReports)
    || (page === 'curation' && !canReadCuration)
    || (page === 'clinical' && !canReadClinical)
    || (page === 'reports' && !canReadReports)
    || (page === 'atlas' && !canReadAtlas)
  ) {
    return (
      <ErrorPage
        message="You are not authorised to view this page"
        returnTo="dashboard"
      />
    );
  }

  return (
    <>
      <Grid container direction="column" wrap="nowrap">
        <AppBar className={classes.topBar}>
          <Toolbar className={classes.topBar} sx={{ padding: '0 32px !important' }}>
            <Grid container direction="row" alignItems="flex-start" wrap="nowrap" width="100%">
              <Grid
                sx={{
                  marginRight: '40px',
                }}
              >
                <ZeroLogoWithRec />
              </Grid>
              <ScrollableSection style={{ minWidth: '200px', width: '100%' }}>
                <Grid container wrap="nowrap">
                  <CustomTabs
                    value={isUntabbedPage ? false : page}
                    variant="navigation"
                    size="xlarge"
                    mode="dark"
                    onChange={handleChangeTab}
                    tabs={[
                      ...(canAccessAllStages ? [{
                        label: 'Overview',
                        value: 'overview',
                      }] : []),
                      ...(canReadCuration ? [{
                        label: 'Curation',
                        value: 'curation',
                      }] : []),
                      ...(canReadClinical ? [{
                        label: 'Clinical',
                        value: 'clinical',
                      }] : []),
                      ...(canReadReports ? [{
                        label: 'Reports',
                        value: 'reports',
                      }] : []),
                      {
                        label: 'File Tracker',
                        value: 'files',
                      },
                      ...(canReadAtlas ? [{
                        label: 'Curation Atlas',
                        value: 'atlas',
                      }] : []),
                    ]}
                  />
                </Grid>
              </ScrollableSection>
            </Grid>
            <Grid style={{ backgroundColor: corePalette.offBlack200, minWidth: '350px', padding: '0px 16px' }}>
              <Box display="flex" alignItems="center" justifyContent="flex-end" gap="16px">
                <CustomTabs
                  // mui complains if we pass page when the value is not /meeting
                  // as there are not tabs defined that are not /meeting
                  value={page === 'meeting' ? page : false}
                  variant="navigation"
                  size="xlarge"
                  mode="dark"
                  tabs={[
                    {
                      label: 'Meetings',
                      value: 'meeting',
                      icon: <CalendarIcon />,
                      iconPosition: 'start',
                      onClick: (e): void => setAnchorElMeetings(e.currentTarget),
                    },
                  ]}
                />
                <Notifications colour={corePalette.white} backgroundColour={corePalette.grey200} />
                <IconButton
                  onClick={(e): void => setAnchorElProfile(e.currentTarget)}
                >
                  <AvatarWithBadge
                    badgeText=""
                    user={currentUser}
                  />
                </IconButton>
              </Box>
            </Grid>
            <Settings
              anchorEl={anchorElProfile}
              setAnchorEl={setAnchorElProfile}
            />
          </Toolbar>
        </AppBar>
        <Outlet />
      </Grid>
      <MeetingsDropdown
        anchorEl={anchorElMeetings}
        setAnchorEl={setAnchorElMeetings}
        setMeetingType={(type): void => {
          navigate(`/meeting?type=${type}`);
        }}
      />
    </>
  );
}
