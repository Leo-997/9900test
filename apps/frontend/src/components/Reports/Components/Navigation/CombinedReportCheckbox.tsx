import { CustomCheckbox } from '@/components/Input/CustomCheckbox';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';

import type { JSX } from "react";

interface IProps {
  disabled?: boolean;
}

export function CombinedReportCheckbox({ disabled }: IProps): JSX.Element | null {
  const {
    reportMetadata,
    updateMetadata,
    isReadOnly,
  } = useReport();

  const canUpdateHidePanel = useIsUserAuthorised('report.meta.write') && !isReadOnly;

  return (
    <CustomCheckbox
      labelProps={{
        label: 'Combined Report',
      }}
      defaultChecked={
        reportMetadata?.['molecular.hidePanel'] === 'true'
      }
      onChange={(e, checked): void => {
        updateMetadata({
          ...reportMetadata,
          'molecular.hidePanel': `${checked}`,
        });
      }}
      disabled={disabled || !canUpdateHidePanel}
    />
  );
}
