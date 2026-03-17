import type { JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import ReportsContent from '../../components/NavBar/Reports/ReportsContent';
import ReportsLeftPane from '../../components/Reports/Components/Navigation/ReportsLeftPane';
import ReportsNavbar from '../../components/Reports/Components/Navigation/ReportsNavbar';
import { ItemSelectLayout } from '../../layouts/FullScreenLayout/ItemSelectLayout';
import { ErrorPage } from '../Error/ErrorPage';

export default function ReportsPage(): JSX.Element {
  const canRead = useIsUserAuthorised('report.read');

  return canRead ? (
    <ItemSelectLayout
      mainContent={<ReportsContent />}
      navBar={<ReportsNavbar />}
      leftPaneNodes={(
        <ReportsLeftPane />
      )}
      includeLeftPane
    />
  ) : (
    <ErrorPage
      message="You are not authorised to view this page"
      returnTo="dashboard"
    />
  );
}
