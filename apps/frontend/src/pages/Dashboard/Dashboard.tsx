import dayjs from 'dayjs';
import { JSX } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import loadable from '@loadable/component';
import { ErrorPage } from '../Error/ErrorPage';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { LoadingPage } from '@/pages/Loading/Loading';

/* eslint-disable @typescript-eslint/naming-convention */
const FileTrackerPage = loadable(
  () => import('../FileTracker/FileTracker'),
  { fallback: <LoadingPage /> },
);
const CurationDashboardPage = loadable(
  () => import('./CurationDashboard'),
  { fallback: <LoadingPage /> },
);
const ClinicalDashboardPage = loadable(
  () => import('./ClinicalDashboard'),
  { fallback: <LoadingPage /> },
);
const MeetingDashboardPage = loadable(
  () => import('./MeetingDashboard'),
  { fallback: <LoadingPage /> },
);
const ReportsDashboard = loadable(
  () => import('./ReportsDashboard'),
  { fallback: <LoadingPage /> },
);
const TaskDashboardPage = loadable(
  () => import('./TaskDashboard'),
  { fallback: <LoadingPage /> },
);

export default function Dashboard(): JSX.Element {
  const { pathname } = useLocation();
  const [search] = useSearchParams();
  const canReadReports = useIsUserAuthorised('report.read');
  const canReadCuration = useIsUserAuthorised('curation.sample.read');
  const canReadClinical = useIsUserAuthorised('clinical.sample.read');

  const canAccessAllStages = canReadReports && canReadCuration && canReadClinical;

  const getDashboardPage = (): JSX.Element => {
    let page = pathname;
    if (pathname === '/dashboard' || pathname === '/') {
      page = canAccessAllStages ? '/overview' : '/curation';
    }
    if (page === '/curation') return <CurationDashboardPage />;
    if (page === '/clinical') return <ClinicalDashboardPage />;
    if (page === '/reports') {
      return canReadReports ? <ReportsDashboard /> : (
        <ErrorPage
          message="You are not authorised to view this page"
          returnTo="dashboard"
        />
      );
    }
    if (page === '/files') return <FileTrackerPage query={search} />;
    if (page === '/overview') {
      return canReadReports ? <TaskDashboardPage /> : (
        <ErrorPage
          message="You are not authorised to view this page"
          returnTo="dashboard"
        />
      );
    }
    if (page === '/meeting') {
      let date: string | undefined;
      const dateParam = search.get('date')?.toLowerCase();
      if (dateParam && dayjs(dateParam).isValid()) {
        date = dateParam;
      }
      if (search.get('type')?.toLowerCase() === 'clinical') {
        return <MeetingDashboardPage type="Clinical" date={date} />;
      }
      return <MeetingDashboardPage type="Curation" date={date} />;
    }

    return <CurationDashboardPage />;
  };
  return getDashboardPage();
}
