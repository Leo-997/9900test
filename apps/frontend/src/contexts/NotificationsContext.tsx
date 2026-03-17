import { EventSource } from 'eventsource';
import { useSnackbar } from 'notistack';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { INotification } from '@/types/Notifications/Notifications.types';
import { useUser } from './UserContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface INotificationContext {
  unreadNotificationCount: number;
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>;
  notifPopupOpen: boolean;
  setNotifPopupOpen: Dispatch<SetStateAction<boolean>>;
}

interface INotificationEvent {
  type: 'notification';
  data: INotification;
}

interface IPingEvent {
  type: 'ping';
  data: 'ping';
}

export const NotificationsContext = createContext<INotificationContext | undefined>(undefined);

export const useNotifications = (): INotificationContext => {
  const ctx = useContext(NotificationsContext);

  if (!ctx) {
    throw new Error('Notifications context is not available at this scope');
  }

  return ctx;
};

interface IProps {
  children: ReactNode;
}

export function NotificationsProvider({
  children,
}: IProps): JSX.Element {
  const applicationId = import.meta.env.VITE_ZERO_DASH_APP_ID;
  const { currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();

  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [notifPopupOpen, setNotifPopupOpen] = useState<boolean>(false);

  const value = useMemo(() => ({
    unreadNotificationCount,
    setUnreadNotificationCount,
    notifPopupOpen,
    setNotifPopupOpen,
  }), [
    unreadNotificationCount,
    setUnreadNotificationCount,
    notifPopupOpen,
    setNotifPopupOpen,
  ]);

  useEffect(() => {
    if (applicationId) {
      zeroDashSdk.services.notifications.getNotificationCount({
        applicationId,
        read: false,
      })
        .then((resp) => setUnreadNotificationCount(resp));
    }
  }, [applicationId, zeroDashSdk.services.notifications]);

  useEffect(() => {
    const createEventSource = (): void => {
      if (applicationId && currentUser?.id) {
        try {
          const notificationSource = new EventSource(
            `${import.meta.env.VITE_NOTIFICATIONS_URL}/notifications/${applicationId}`,
            {
              fetch: (input, init) => fetch(input, {
                ...init,
                headers: {
                  ...init.headers,
                },
              }),

            },
          );

          notificationSource.onerror = ((): void => {
            notificationSource.close();
          });

          notificationSource.onmessage = (event): void => {
            if (event.data) {
              const data = JSON.parse(event.data) as INotificationEvent | IPingEvent;
              if (data.type === 'notification') {
                enqueueSnackbar(
                  'You have a new notification',
                  {
                    variant: 'info',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    SnackbarProps: {
                      onClick: () => {
                        setNotifPopupOpen(true);
                      },
                    },
                    style: {
                      cursor: 'pointer',
                    },
                  },
                );
                setUnreadNotificationCount((prev) => prev + 1);
              }
            }
          };
        } catch {
          enqueueSnackbar('Could not connect notifications, please try again', { variant: 'error' });
        }
      }
    };

    createEventSource();
  }, [
    applicationId,
    currentUser?.id,
    enqueueSnackbar,
  ]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
