import type { JSX } from 'react';
import { IComparisonWorkspaceState } from '@/types/Comparison.types';
import ComparisonSelectionPanel from './ComparisonSelectionPanel';

interface IProps {
  workspaceState: IComparisonWorkspaceState;
}

export default function ComparisonWorkspaceSidebar({
  workspaceState,
}: IProps): JSX.Element {
  return <ComparisonSelectionPanel workspaceState={workspaceState} />;
}
