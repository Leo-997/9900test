import { PreclinicalReport } from '@/components/Reports/ReportPreviews/PreclinicalReport';
import { ReportDataProvider } from '@/contexts/Reports/ReportDataContext';
import { ClinicalProvider } from '../../../contexts/ClinicalContext';
import { ReportType } from '../../../types/Reports/Reports.types';
import GermlineReport from '../../Reports/ReportPreviews/GermlineReport';
import { MolecularReport } from '../../Reports/ReportPreviews/MolecularReport';
import { MTBReport } from '../../Reports/ReportPreviews/MTBReport';

import type { JSX } from "react";

interface IReportPreviewProps {
  reportType: ReportType;
}

export function ReportPreview({
  reportType,
}: IReportPreviewProps): JSX.Element {
  const getReport = (): JSX.Element => {
    if (reportType === 'MOLECULAR_REPORT') return (<MolecularReport />);
    if (reportType === 'MTB_REPORT') {
      return (
        <ClinicalProvider
          versionId="latest"
        >
          <MTBReport />
        </ClinicalProvider>
      );
    }
    if (reportType === 'GERMLINE_REPORT') return (<GermlineReport />);
    if (reportType === 'PRECLINICAL_REPORT') {
      return (
        <ClinicalProvider
          versionId="latest"
        >
          <PreclinicalReport />
        </ClinicalProvider>
      );
    }
    return <div />;
  };

  return (
    <ReportDataProvider>
      {getReport()}
    </ReportDataProvider>
  );
}
