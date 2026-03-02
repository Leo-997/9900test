import { ClinicService, IAnnex1Row } from '@/types/Reports/Reports.types';
import { IReportTableRow } from '../../../../types/Reports/Table.types';

const getServiceContent = (
  { service, hospital }: ClinicService,
): string => {
  if (service && !hospital) return service;
  if (!service && hospital) return hospital;

  return `${service}\n${hospital}`;
};

export function formatAnnex1(
  row: IAnnex1Row,
  widths: string[],
): IReportTableRow[] {
  return row.clinics.map((clinic, index) => (
    {
      columns: [
        {
          content: index === 0 ? `**${row.region}**` : '',
          width: widths[0],
          styleOverrides: { verticalAlign: 'top' },
        },
        {
          content: `**${clinic.location}**`,
          width: widths[1],
          styleOverrides: { verticalAlign: 'top' },
        },
        {
          content: getServiceContent(clinic.service),
          width: widths[2],
          styleOverrides: { verticalAlign: 'top' },
        },
        {
          content: clinic.email,
          width: widths[3],
          styleOverrides: { verticalAlign: 'top' },
        },
      ],
      noBottomBorder: (row.clinics.length - 1 !== index),
    }
  ));
}
