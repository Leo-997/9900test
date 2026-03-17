import LabelledInputWrapper from '@/components/Common/LabelledInputWrapper';
import { AutoWidthSelect } from '@/components/Input/Select/AutoWidthSelect';
import { germlineReportAttachmentOptions } from '@/constants/Reports/reports';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { GermlineReportAttachmentOptions } from '@/types/Reports/Reports.types';
import { ReactNode, type JSX } from 'react';

export function GermlineAttachmentSelection(): JSX.Element {
  const {
    reportMetadata,
    updateMetadata,
    isReadOnly,
  } = useReport();

  const canUpdateHidePanel = useIsUserAuthorised('report.meta.write') && !isReadOnly;

  const isOptionDisabled = (option: GermlineReportAttachmentOptions): boolean => {
    const value: GermlineReportAttachmentOptions[] = reportMetadata?.['germline.attachments']
      ? JSON.parse(reportMetadata['germline.attachments'])
      : [];

    if (option === 'No attachment') {
      return value.includes('Genetics contact list') || value.includes('No findings factsheet');
    }

    return value.includes('No attachment');
  };

  return (
    <LabelledInputWrapper label="Attachment(s)" required>
      <AutoWidthSelect
        aria-placeholder="Select attachment"
        multiple
        options={germlineReportAttachmentOptions.map((o) => ({
          name: o,
          value: o,
          disabled: isOptionDisabled(o),
        }))}
        value={
          reportMetadata?.['germline.attachments']
            ? JSON.parse(reportMetadata['germline.attachments'])
            : []
        }
        renderValue={(value): ReactNode => ((value as string[]).length === 0
          ? <span style={{ color: corePalette.grey100 }}>Select attachment…</span>
          : (value as string[]).join(', '))}
        onChange={(e): void => {
          const newAttachments = e.target.value as string[];
          updateMetadata({
            ...reportMetadata,
            'germline.attachments': JSON.stringify(newAttachments),
          });
        }}
        displayEmpty
        overrideReadonlyMode={!canUpdateHidePanel}
      />
    </LabelledInputWrapper>
  );
}
