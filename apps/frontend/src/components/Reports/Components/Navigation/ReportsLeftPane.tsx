import { reportOptions } from '@/constants/Reports/reports';
import { useReport } from '../../../../contexts/Reports/CurrentReportContext';
import ReportVersionSelect from './ReportVersionSelect';

import type { JSX } from "react";

export default function ReportsLeftPane():JSX.Element {
  const { demographics } = useReport();

  const reportsOptions = reportOptions.filter(
    (option) => option.value !== 'GERMLINE_REPORT' || (
      demographics?.germlineConsent
      || demographics?.category1Consent !== undefined
      || demographics?.category2Consent !== undefined
    ),
  );

  return (
    <>
      {reportsOptions.map((reportOption) => (
        <ReportVersionSelect
          key={reportOption.value}
          reportType={reportOption.value}
          reportName={reportOption.name}
        />
      ))}
    </>
  );
}
