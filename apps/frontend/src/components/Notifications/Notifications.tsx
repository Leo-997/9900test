import { useNotifications } from '@/contexts/NotificationsContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { INotification, INotificationQuery } from '@/types/Notifications/Notifications.types';
import {
  Badge,
  Box,
  Divider,
  IconButton, Popover,
  Switch,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { BellIcon, BellRing, CheckCheckIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useRef, useState, type JSX } from 'react';
import CustomTypography from '../Common/Typography';
import TabContentWrapper from '../PreCurationTabs/TabContentWrapper';
import { NotificationItem } from './NotificationItem';

const useStyles = makeStyles(() => ({
  tabContentWrapper: {
    height: 'calc(100% - 69px)',
    width: '100%',
    '& .simplebar-scrollbar': {
      top: '0px !important',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      backgroundColor: corePalette.yellow150,
    },
  },
}));

interface IProps {
  colour?: string;
  backgroundColour?: string;
}

export function Notifications({
  colour = corePalette.offBlack100,
  backgroundColour = corePalette.grey30,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    unreadNotificationCount,
    setUnreadNotificationCount,
    notifPopupOpen,
    setNotifPopupOpen,
  } = useNotifications();

  const applicationId = import.meta.env.VITE_ZERO_DASH_APP_ID;
  const [filters, setFilters] = useState<INotificationQuery>({
    applicationId,
  });

  const anchorEl = useRef<HTMLButtonElement | null>(null);

  const getNotificationsIcon = (): ReactNode => {
    if (unreadNotificationCount) {
      return (
        <BellRing fill={notifPopupOpen ? 'currentColor' : 'transparent'} />
      );
    }

    return <BellIcon fill={notifPopupOpen ? 'currentColor' : 'transparent'} />;
  };

  const handleMarkAllRead = async (): Promise<void> => {
    if (applicationId) {
      try {
        await zeroDashSdk.services.notifications.markAllNotificationAsRead(applicationId);
        // this causes tab content wrapper to reload, which is what we want
        setFilters((prev) => ({
          ...prev,
        }));
        setUnreadNotificationCount(0);
      } catch {
        enqueueSnackbar('Could not mark all notifications as read, please try again.', { variant: 'error' });
      }
    }
  };

  const fetch = useCallback(async (page: number, limit: number): Promise<INotification[]> => {
    const notifs = await zeroDashSdk.services.notifications.getNotifications(
      {
        ...filters,
        applicationId,
        read: filters.read === false ? filters.read : undefined,
      },
      page,
      limit,
    );

    return notifs;
  }, [filters, zeroDashSdk.services.notifications, applicationId]);

  const mapping = useCallback((
    notification: INotification,
    key: number,
    update?: (value: INotification) => void,
  ): ReactNode => (
    <NotificationItem
      key={notification.id}
      notification={notification}
      updateNotification={update}
    />
  ), []);

  useEffect(() => {
    if (applicationId && notifPopupOpen) {
      zeroDashSdk.services.notifications.getNotificationCount({
        applicationId,
        read: false,
      })
        .then((resp) => setUnreadNotificationCount(resp));
    }
  }, [
    applicationId,
    zeroDashSdk.services.notifications,
    setUnreadNotificationCount,
    notifPopupOpen,
  ]);

  return (
    <>
      <Badge
        badgeContent={unreadNotificationCount}
        className={classes.badge}
      >
        <IconButton
          sx={{
            marginRight: '8px',
            color: colour,
            padding: '8px',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: backgroundColour,
            },
          }}
          onClick={(): void => setNotifPopupOpen(true)}
          ref={anchorEl}
        >
          {getNotificationsIcon()}
        </IconButton>
      </Badge>
      <Popover
        open={notifPopupOpen}
        onClose={(): void => setNotifPopupOpen(false)}
        anchorEl={anchorEl.current}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        <Box
          display="flex"
          flexDirection="column"
          width="500px"
          height="600px"
        >
          <Box
            padding="16px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`1px solid ${corePalette.grey30}`}
          >
            <CustomTypography variant="h5" fontWeight="medium">
              Notifications
            </CustomTypography>
            <Box display="flex" flexDirection="row" alignItems="center" gap="8px" height="100%">
              <CustomTypography variant="bodyRegular">
                Hide read
              </CustomTypography>
              <Switch
                checked={filters.read === false}
                onChange={(e, checked): void => setFilters((prev) => ({ ...prev, read: !checked }))}
              />
              <Divider orientation="vertical" />
              <Tooltip
                title="Mark all as read"
              >
                <IconButton
                  sx={{
                    color: corePalette.offBlack100,
                    padding: '6px',
                  }}
                  onClick={handleMarkAllRead}
                >
                  <CheckCheckIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TabContentWrapper
            fetch={fetch}
            mapping={mapping}
            className={classes.tabContentWrapper}
          />
        </Box>
      </Popover>
    </>
  );
}
