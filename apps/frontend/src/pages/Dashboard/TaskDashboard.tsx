import TaskDashboardTabContent from '@/components/TaskDashboard/TaskDashboardTabContent';
import { Grid, styled } from '@mui/material';
import CustomTypography from '../../components/Common/Typography';
import { useUser } from '../../contexts/UserContext';

import type { JSX } from "react";

const WELCOME_MESSAGE_BAR_HEIGHT = 64;

const Page = styled('div')(({ theme }) => ({
  marginTop: 80,
  padding: '20px 24px 0',
  backgroundColor: theme.colours.core.grey10,
  height: 'calc(100vh - 80px)',
  width: '100%',
  maxHeight: 'calc(100vh - 80px)',
  maxWidth: '100vw',
  overflow: 'hidden',
  display: 'flex',
  borderTopLeftRadius: '22px',
}));

const PageBg = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  backgroundColor: theme.colours.core.offBlack200,
  zIndex: -1,
}));

const Content = styled('div')(() => ({
  flexGrow: 1,
  paddingLeft: 24,
  paddingRight: 24,
  marginBottom: 24,
  maxHeight: '100%',
  width: '100%',
}));

const WelcomeMsgBar = styled(Grid)(() => ({
  height: `${WELCOME_MESSAGE_BAR_HEIGHT}px`,
}));

const SampleSection = styled(Grid)(() => ({
  marginTop: 24,
  maxHeight: `calc(100% - ${WELCOME_MESSAGE_BAR_HEIGHT}px - 40px)`,
  width: '100%',
  maxWidth: '100%',
}));

export default function TaskDashboardPage(): JSX.Element {
  const { currentUser } = useUser();

  return (
    <Page>
      <PageBg />
      <Content>
        <Grid
          container
          direction="column"
          sx={{ height: '100%', width: '100%' }}
          wrap="nowrap"
        >
          <WelcomeMsgBar>
            <CustomTypography variant="h2" fontWeight="bold">
              Hi
              {currentUser?.givenName ? ` ${currentUser.givenName}` : ''}
              ,
              here&apos;s the latest on Zerodash
            </CustomTypography>
          </WelcomeMsgBar>
          <SampleSection>
            <TaskDashboardTabContent />
          </SampleSection>
        </Grid>
      </Content>
    </Page>
  );
}
