import type { JSX } from 'react';
import ComparisonPreview from '@/components/Comparison/ComparisonPreview';
import { useComparisonWorkspaceState } from '@/hooks/Comparison/useComparisonWorkspaceState';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import ComparisonWorkspaceLayout from '@/components/Comparison/ComparisonWorkspaceLayout';
import ComparisonWorkspaceSidebar from '@/components/Comparison/ComparisonWorkspaceSidebar';
import { ErrorPage } from '../Error/ErrorPage';

export default function ComparisonWorkspacePage(): JSX.Element {
  const canRead = useIsUserAuthorised('curation.sample.read');
  const workspaceState = useComparisonWorkspaceState();

  return canRead ? (
    <ComparisonWorkspaceLayout
      leftPanel={<ComparisonWorkspaceSidebar workspaceState={workspaceState} />}
      workspace={<ComparisonPreview workspaceState={workspaceState} />}
    />
  ) : (
    <ErrorPage
      message="You are not authorised to view this page"
      returnTo="dashboard"
    />
  );
}
