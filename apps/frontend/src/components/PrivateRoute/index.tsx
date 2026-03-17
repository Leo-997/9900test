import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { useUser } from '@/contexts/UserContext';
import { ErrorPage } from '@/pages/Error/ErrorPage';
import { LoadingPage } from '@/pages/Loading/Loading';

export function PrivateRoute(): ReactNode {
  const { currentUser } = useUser();

  if (currentUser === undefined) {
    return <LoadingPage />;
  }

  if (currentUser === null) {
    return (
      <ErrorPage
        message="Your user either doesn't exist in our database, or you are not logged in."
        returnTo="login"
      />
    );
  }

  return (
    <NotificationsProvider>
      <Outlet />
    </NotificationsProvider>
  );
}
