// Function for getting the latest report version whose status is not "cancelled" or "rejected"

import { IReport, ReportType } from '@/types/Reports/Reports.types';
import dayjs from 'dayjs';

export const getReport = (
  id: string,
  reportType: ReportType,
  reports: IReport[],
): IReport | null => {
  const filteredReports = reports.filter(
    (r) => r.analysisSetId === id
    && r.type === reportType
    && !['cancelled', 'rejected'].includes(r.status),
  );
  if (!filteredReports.length) return null;

  let returnedReport = filteredReports[0];
  // Check if filteredReports/length > 1, i.e. there are "previously generated reports",
  // then return the last created one
  if (filteredReports.length > 1) {
    returnedReport = filteredReports.reduce((latest, current) => (
      dayjs(current.createdAt).isAfter(dayjs(latest.createdAt)) ? current : latest
    ));
  }

  return returnedReport;
};
