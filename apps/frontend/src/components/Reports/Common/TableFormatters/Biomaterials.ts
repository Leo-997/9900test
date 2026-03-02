import { IBiosample, SampleType } from '@/types/Analysis/Biosamples.types';
import { ReportMetadata, ReportType } from '@/types/Reports/Reports.types';
import dayjs from 'dayjs';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { IBiomaterial } from '../../../../types/Samples/Sample.types';
import { getPreservationText } from '../../../../utils/functions/getPreservationText';
import { mapAssayName } from '../../../../utils/functions/mapAssayName';
import { mapBiosampleStatus } from '../../../../utils/functions/mapBiosampleStatus';
import { mapTissueType } from '../../../../utils/functions/mapTissueType';

export function formatBiomaterial(
  biomaterial: IBiomaterial,
  widths: string[],
  htsBiosamples?: IBiosample[],
  reportMetadata: ReportMetadata = {},
  showPreclinical = false,
): IReportTableCell[] {
  return [
    { width: widths[0], content: `${biomaterial.biomaterialId}` },
    {
      width: widths[1],
      content: `${mapBiosampleStatus(biomaterial.biosampleStatus)} (${biomaterial.tissue})`,
    },
    { width: widths[2], content: biomaterial.preservation ? getPreservationText(biomaterial.preservation) : '-' },
    {
      width: widths[3],
      content: biomaterial.collectionDate
        ? dayjs(biomaterial.collectionDate).format('DD/MM/YYYY')
        : '',
    },
    {
      width: widths[4],
      content: biomaterial.processingDate
        ? dayjs(biomaterial.processingDate).format('DD/MM/YYYY')
        : '-',
    },
    {
      width: widths[5],
      content: [
        ...new Set(
          biomaterial.assays
            ?.filter((a) => {
              const isHTS = a.sampleType.toLowerCase() === 'hts';
              const htsSelectedBiosample = htsBiosamples
                ?.find((b) => b.biosampleId === reportMetadata?.['preclinical.htsBiosampleId']);
              const isSelectedBiomaterial = htsSelectedBiosample
                && htsSelectedBiosample.biomaterialId === biomaterial.biomaterialId;
              return (showPreclinical && isSelectedBiomaterial) || !isHTS;
            })
            .map((a) => mapAssayName(a)),
        ),
      ].join('\n'),
    },
  ];
}

export function mapSampleType(sampleType: SampleType): string {
  switch (sampleType) {
    case 'hts':
      return 'HTS = High Throughput Screening';
    case 'pdx':
      return 'PDX = Patient-Derived Xenograft';
    default:
      return sampleType.toUpperCase();
  }
}

export function getLegend(biomaterials: IBiomaterial[], reportType: ReportType): string {
  const sampleTypeString = [
    ...new Set(biomaterials
      .flatMap((b) => b.assays)
      .filter((a) => a?.sampleType === 'hts' || a?.sampleType === 'pdx')
      .map((a) => (a ? mapSampleType(a?.sampleType) : ''))
      .filter((type) => type)),
  ]
    .join(', ');

  const tissueString = [...new Set(biomaterials.map((b) => b.tissue))]
    .map((t) => (t ? `${t} = ${mapTissueType(t)}` : ''))
    .join(', ');

  if (sampleTypeString && reportType === 'PRECLINICAL_REPORT') return `${tissueString}; ${sampleTypeString}`;
  return tissueString;
}
