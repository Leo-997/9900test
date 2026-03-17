import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { DashboardExportOptions } from '@/types/Search.types';
import { getGermlineBiosample } from '@/utils/functions/biosamples/getGermlineBiosample';
import { getHtsBiosamples } from '@/utils/functions/biosamples/getHtsBiosamples';
import { getMethBiosample } from '@/utils/functions/biosamples/getMethBiosample';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import { getRnaBiosample } from '@/utils/functions/biosamples/getRnaBiosample';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import mapEvent from '@/utils/functions/mapEvent';
import dayjs from 'dayjs';

export const curationExportOptions: DashboardExportOptions = {
  patientId: {
    label: 'Patient ID',
    selected: true,
    key: 'patientId',
  },
  sampleId: {
    label: 'Sample ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getTumourBiosample(biosamples as IBiosample[] || [])?.biosampleId ?? '-'
    ),
  },
  normalId: {
    label: 'Germline ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getGermlineBiosample(biosamples as IBiosample[] || [])?.biosampleId ?? '-'
    ),
  },
  publicSubjectId: {
    label: 'Public subject ID',
    selected: true,
    key: 'publicSubjectId',
    transform: (value): string => `zccs${value as number}`,
  },
  manifestName: {
    label: 'Manifest ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getTumourBiosample(biosamples as IBiosample[] || [])?.manifestName ?? '-'
    ),
  },
  rnaseqId: {
    label: 'RNA-Seq ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getRnaBiosample(biosamples as IBiosample[] || [])?.biosampleId ?? '-'
    ),
  },
  methSampleId: {
    label: 'Methylation ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getMethBiosample(biosamples as IBiosample[] || [])?.biosampleId ?? '-'
    ),
  },
  htsId: {
    label: 'HTS ID',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getHtsBiosamples(biosamples as IBiosample[] || [])
        ?.map((b) => b.biosampleId)
        .join(';') ?? '-'
    ),
  },
  event: {
    label: 'Event type',
    selected: true,
    key: 'sequencedEvent',
    transform: (event): string => (
      mapEvent(event as string, true)
    ),
  },
  collection: {
    label: 'Collection Date',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getPrimaryBiosample(biosamples as IBiosample[] || [])?.collectionDate
        ? dayjs(getPrimaryBiosample(biosamples as IBiosample[] || [])?.collectionDate).format('YYYY-MM-DD')
        : '-'
    ),
  },
  ageAtDiagnosis: {
    label: 'Age at diagnosis',
    selected: true,
    key: 'ageAtDiagnosis',
  },
  ageAtSample: {
    label: 'Age at sample',
    selected: true,
    key: 'biosamples',
    transform: (biosamples): string => (
      getTumourBiosample(biosamples as IBiosample[] || [])?.ageAtSample ?? '-'
    ),
  },
  ageAtDeath: {
    label: 'Age at death',
    selected: true,
    key: 'ageAtDeath',
  },
  vitalStatus: {
    label: 'Vital status',
    selected: true,
    key: 'vitalStatus',
  },
  gender: {
    label: 'Sex at birth',
    selected: true,
    key: 'gender',
  },
  cohort: {
    label: 'Cohort',
    selected: true,
    transform: (value): string => (
      value
        ? (value as string).replace(/,/g, ';')
        : ''
    ),
    key: 'cohort',
  },
  zero2Category: {
    label: 'ZERO2 Category',
    selected: true,
    transform: (value): string => (
      value
        ? (value as string).replace(/,/g, ';')
        : ''
    ),
    key: 'zero2Category',
  },
  zero2Subcat1: {
    label: 'ZERO2 Subcategory 1',
    selected: true,
    transform: (value): string => (
      value
        ? (value as string).replace(/,/g, ';')
        : ''
    ),
    key: 'zero2Subcategory1',
  },
  zero2Subcat2: {
    label: 'ZERO2 Subcategory 2',
    selected: true,
    transform: (value): string => (
      value
        ? (value as string).replace(/,/g, ';')
        : ''
    ),
    key: 'zero2Subcategory2',
  },
  zero2FinalDiagnosis: {
    label: 'ZERO2 Final diagnosis',
    selected: true,
    transform: (value): string => (
      value
        ? (value as string).replace(/,/g, ';')
        : ''
    ),
    key: 'zero2FinalDiagnosis',
  },
};
