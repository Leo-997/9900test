import { type JSX } from 'react';
import {
  BrowserRouter, Navigate, Route, Routes as RouterRoutes,
} from 'react-router-dom';
import loadable from '@loadable/component';
import { PrivateRoute } from '@/components/PrivateRoute';
import { curationAtlasTabs, curationTabs } from '@/constants/Curation/tabs';
import { AnalysisSetProvider } from '@/contexts/AnalysisSetContext';
import { ClinicalProvider } from '@/contexts/ClinicalContext';
import { CurationContextProvider } from '@/contexts/CurationContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { CurrentReportProvider } from '@/contexts/Reports/CurrentReportContext';
import DashboardLayout from '@/layouts/Dashboard';
import { LoadingPage } from '@/pages/Loading/Loading';

/* eslint-disable @typescript-eslint/naming-convention */
const LoginPage = loadable(() => import('@/pages/Login/Login'), {
  fallback: <LoadingPage />,
});
const LoginRedirectPage = loadable(() => import('@/pages/Login/Redirect'), {
  fallback: <LoadingPage />,
});
const ReportsPage = loadable(() => import('@/pages/Reports/ReportsPage'), {
  fallback: <LoadingPage />,
});
const Dashboard = loadable(() => import('@/pages/Dashboard/Dashboard'), {
  fallback: <LoadingPage />,
});
const PanelListView = loadable(() => import('@/pages/Atlas/PanelListView'), {
  fallback: <LoadingPage />,
});
const CurationRoutes = loadable(() => import('./CurationRoutes'), {
  fallback: <LoadingPage />,
});
const MTBLayout = loadable(() => import('@/layouts/MTB'), {
  fallback: <LoadingPage />,
});
const CurationAtlasRoutes = loadable(() => import('@/pages/Atlas/CurationAtlasPage'), {
  fallback: <LoadingPage />,
});

export function Routes(): JSX.Element {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            {['/', '/curation', '/clinical', '/dashboard', '/meeting', '/files', '/reports', '/overview'].map((path) => (
              <Route
                key={path}
                index={path === '/'}
                path={path !== '/' ? path : undefined} // index takes care of the case where path = '/'
                element={<Dashboard />}
              />
            ))}
            <Route
              path="/atlas"
              element={<CurationAtlasRoutes />}
            >
              <Route
                index
                element={<Navigate to="gene-dashboard" replace />}
              />
              {curationAtlasTabs.map(({ to, children }) => (
                <Route
                  key={to}
                  path={to}
                  element={children}
                />
              ))}
              <Route
                key="gene-dashboard/:type/:idName"
                path="gene-dashboard/:type/:idName"
                element={(<PanelListView />)}
              />
            </Route>
          </Route>
          <Route path=":patientId" element={<PatientProvider />}>
            <Route path=":analysisSetId" element={<AnalysisSetProvider />}>
              <Route element={<CurationContextProvider />}>
                <Route element={<CurrentReportProvider />}>
                  <Route
                    path="curation"
                    element={<CurationRoutes />}
                  >
                    {curationTabs.map(({ to, children, altPaths = [] }) => (
                      <Route element={children} key={`curation-route-${to}`}>
                        <Route path={`${to}`} />
                        {altPaths.map((p) => (
                          <Route
                            key={p}
                            index={p.length === 0}
                            path={p.length ? p : undefined}
                          />
                        ))}
                      </Route>
                    ))}
                  </Route>
                  <Route
                    path="reports"
                    element={<ReportsPage />}
                  >
                    <Route index />
                    <Route path=":reportId" />
                  </Route>
                </Route>
              </Route>
              <Route element={<CurrentReportProvider initialReportType="MTB_REPORT" />}>
                <Route
                  path="clinical/:clinicalVersionId/mtb/:view?"
                  element={(
                    <ClinicalProvider>
                      <MTBLayout />
                    </ClinicalProvider>
                  )}
                />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="login">
          <Route index element={<LoginPage />} />
          <Route path="redirect" element={<LoginRedirectPage />} />
        </Route>
      </RouterRoutes>
    </BrowserRouter>
  );
}
