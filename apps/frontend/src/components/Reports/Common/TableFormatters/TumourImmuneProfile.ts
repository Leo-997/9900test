import { IImmunoprofile } from '../../../../types/Precuration/QCMetrics.types';
import { IReportTableRow } from '../../../../types/Reports/Table.types';

export function formatTumourImmuneProfile(
  widths: string[],
  immunoprofile?: IImmunoprofile,
): IReportTableRow[] {
  const {
    ipassStatus,
    ipassValue,
    ipassptile,
    m1m2Value,
    m1m2ptile,
    cd8Value,
    cd8ptile,
  } = { ...immunoprofile };

  const getContent = (
    value: number | null | undefined,
    percentile: number | null | undefined,
    status?: string,
  ): string => {
    const formattedValue = value !== undefined && value !== null
      ? value.toFixed(2)
      : '';

    const formattedPercentile = percentile !== undefined && percentile !== null
      ? ` (${percentile.toFixed(1)}%)`
      : '';

    if (formattedValue) {
      return `${status ? `${status}; ` : ''}${formattedValue}${formattedPercentile}`;
    }
    return 'N/A';
  };

  const getContentScientific = (
    value: number | null | undefined,
    percentile: number | null | undefined,
    status?: string,
  ): string => {
    const formattedValue = typeof value === 'number'
      ? value.toExponential(2)
      : '';

    const formattedPercentile = percentile !== undefined && percentile !== null
      ? ` (${percentile.toFixed(1)}%)`
      : '';

    if (formattedValue) {
      return `${status ? `${status}; ` : ''}${formattedValue}${formattedPercentile}`;
    }

    return 'N/A';
  };

  return [{
    columns: [
      {
        width: widths[0],
        content: getContent(ipassValue, ipassptile, ipassStatus),
      },
      {
        width: widths[1],
        content: getContent(m1m2Value, m1m2ptile),
      },
      {
        width: widths[2],
        content: getContentScientific(cd8Value, cd8ptile),
      },
    ],
  }];
}
