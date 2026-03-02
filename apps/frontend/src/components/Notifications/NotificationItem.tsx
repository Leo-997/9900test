import {
  zeroDashClinicalTypes, zeroDashCurationTypes, zeroDashFlagTypes, zeroDashReportTypes,
} from '@/constants/Common/notifications';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { INotification, IZeroDashClinicalMeta, IZeroDashReportMeta } from '@/types/Notifications/Notifications.types';
import {
  Box, ButtonBase, IconButton, Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useRef, useState, type JSX } from 'react';
import { CheckIcon } from 'lucide-react';
import CustomTypography from '../Common/Typography';
import { AvatarWithBadge } from '../CustomIcons/AvatarWithBadge';

const useStyles = makeStyles(() => ({
  buttonHover: {
    textDecoration: 'none',
    backgroundColor: corePalette.grey10,
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
    '&$disabled': {
      backgroundColor: 'transparent',
    },
  },
  root: {
    '&:hover': {
      backgroundColor: corePalette.grey10,
      cursor: 'pointer',
    },
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    WebkitLineClamp: 2,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    WebkitBoxOrient: 'vertical',
  },
}));

interface IProps {
  notification: INotification;
  updateNotification?: (value: INotification) => void
}

export function NotificationItem({
  notification,
  updateNotification,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { users } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { setUnreadNotificationCount } = useNotifications();

  const [mouseOver, setMouseOver] = useState<boolean>(false);
  const [mouseOverReadBtn, setMouseOverReadBtn] = useState<boolean>(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const getUrl = (): string => {
    const baseUrl = `/${notification.entityMetadata.patientId}/${notification.entityMetadata.analysisSetId}`;
    if (notification.type === 'REPORT_REMINDER') {
      return `/reports?statuses=pending&approvers=${notification.notifyUserId}`;
    }

    if (
      [...zeroDashCurationTypes, ...zeroDashFlagTypes]
        .some((type) => type === notification.type)
    ) {
      return `/${baseUrl}/curation`;
    }

    if (zeroDashClinicalTypes.some((type) => type === notification.type)) {
      const metaData = notification.entityMetadata as IZeroDashClinicalMeta;
      return `${baseUrl}/clinical/${metaData.clinicalVersionId}/mtb/OVERVIEW`;
    }

    if (zeroDashReportTypes.some((type) => type === notification.type)) {
      const metaData = notification.entityMetadata as IZeroDashReportMeta;
      return `${baseUrl}/reports?reportId=${metaData.reportId}`;
    }

    return '';
  };

  const handleReadNotification = async (
    e: React.MouseEvent,
    action: 'read' | 'unread',
  ): Promise<void> => {
    e.stopPropagation();
    try {
      if (action === 'read') {
        await zeroDashSdk.services.notifications.markNotificationAsRead(notification.id);
        setUnreadNotificationCount((prev) => prev - 1);
      } else {
        await zeroDashSdk.services.notifications.markNotificationAsUnread(notification.id);
        setUnreadNotificationCount((prev) => prev + 1);
      }
      if (updateNotification) {
        updateNotification(
          {
            ...notification,
            readAt: action === 'read' ? dayjs().toISOString() : '',
          },
        );
      }
    } catch {
      enqueueSnackbar('Could not update notification, please try again', { variant: 'error' });
    }
  };

  return (
    <ButtonBase
      disableRipple
      onClick={(): WindowProxy | null => window.open(getUrl(), '_blank')}
      style={{
        textDecoration: 'none',
        color: 'unset',
        pointerEvents: mouseOverReadBtn ? 'none' : undefined,
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        gap="16px"
        padding="16px"
        borderBottom={`1px solid ${corePalette.grey50}`}
        textAlign="left"
        className={classes.root}
        onMouseEnter={(): void => setMouseOver(true)}
        onMouseLeave={(): void => setMouseOver(false)}
      >
        <AvatarWithBadge user={users.find((user) => user.id === notification.createdBy)} />
        <Box display="flex" flexDirection="column" flex={1}>
          <Box display="flex" justifyContent="space-between">
            <CustomTypography
              fontWeight="bold"
              style={{
                flex: 1,
                paddingRight: '10px',
              }}
              className={classes.title}
            >
              {notification.title}
            </CustomTypography>
            <CustomTypography
              style={{ whiteSpace: 'nowrap' }}
              variant="label"
            >
              {notification.createdAt ? dayjs(notification.createdAt).fromNow() : 'Date Unknown'}
            </CustomTypography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="8px">
            <CustomTypography>
              {notification.description}
            </CustomTypography>
            <Tooltip title={`Mark as ${notification.readAt ? 'unread' : 'read'}`}>
              <IconButton
                ref={buttonRef}
                style={{
                  color: '#022034',
                  padding: '6px',
                  minWidth: '36px',
                  minHeight: '36px',
                  pointerEvents: 'auto',
                }}
                onClick={(e): Promise<void> => handleReadNotification(e, notification.readAt ? 'unread' : 'read')}
                className={clsx({
                  [classes.buttonHover]: mouseOver,
                })}
                onMouseEnter={(): void => setMouseOverReadBtn(true)}
                onMouseLeave={(): void => setMouseOverReadBtn(false)}
              >
                {!notification.readAt && (
                  <CheckIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </ButtonBase>
  );
}
