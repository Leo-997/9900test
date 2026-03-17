import { IBiosample } from '@/types/Analysis/Biosamples.types';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { IPatientDiagnosisColumn } from '../../types/MTB/MTB.types';
import { SampleType } from '../../types/Samples/Sample.types';
import { getPreservationText } from '../../utils/functions/getPreservationText';
import { mapAssayName } from '../../utils/functions/mapAssayName';
import mapEvent from '../../utils/functions/mapEvent';
import { mapTissueType } from '../../utils/functions/mapTissueType';
import { toFixed } from '../../utils/math/toFixed';

export const defaultPatientDiagnosisColumnSettings: IPatientDiagnosisColumn[] = [
  {
    label: 'Oncologist',
    key: 'treatingOncologist',
    visible: true,
    settingKey: 'showOncologist',
  },
  {
    label: 'Hospital',
    key: 'site',
    visible: true,
    settingKey: 'showHospital',
  },
  {
    label: 'Time to MTB',
    key: 'mtbMeetingDate',
    visible: false,
    settingKey: 'showTimeToMtb',
    displayTransform: (value, patient): ReactNode => {
      if (patient?.enrolmentDate) {
        const weeks = dayjs(value as string).diff(dayjs(patient.enrolmentDate), 'week');
        return (
          <>
            {weeks}
            {` Week${weeks === 1 ? '' : 's'}`}
          </>
        );
      }
      return '-';
    },
  },
  {
    label: 'Type of Sample',
    key: 'biosamples',
    visible: false,
    settingKey: 'showSampleType',
    displayTransform: (
      value: IBiosample[] | undefined,
    ): string => {
      if (value) {
        const tumourBiosample = value.find(
          (biosample) => (
            ['wgs', 'panel'].includes(biosample.sampleType)
            && biosample.biosampleStatus === 'tumour'
            && biosample.biosampleType === 'dna'
          ),
        );
        return tumourBiosample?.specimen ? mapTissueType(tumourBiosample?.specimen) : '-';
      }
      return '-';
    },
  },
  {
    label: 'Preservation State',
    key: 'biosamples',
    visible: false,
    settingKey: 'showPreservationState',
    displayTransform: (
      value: IBiosample[] | undefined,
    ): string => {
      if (value) {
        const tumourBiosample = value.find(
          (biosample) => (
            ['wgs', 'panel'].includes(biosample.sampleType)
            && biosample.biosampleStatus === 'tumour'
            && biosample.biosampleType === 'dna'
          ),
        );
        return tumourBiosample?.specimenState ? getPreservationText(tumourBiosample?.specimenState) : '-';
      }
      return '-';
    },
  },
  {
    label: 'Cohort',
    key: 'cohort',
    visible: true,
    settingKey: 'showCohort',
  },
  {
    label: 'Histological Diagnosis',
    key: 'histologicalDiagnosis',
    visible: false,
    settingKey: 'showHistologicalDiagnosis',
  },
  {
    label: 'Event',
    key: 'sequencedEvent',
    visible: false,
    settingKey: 'showEvent',
    displayTransform: (value: string) => mapEvent(value, true),
  },
  {
    label: 'Tumour mutational burden',
    key: 'tumourMutationBurden',
    visible: false,
    settingKey: 'showTumourMutationMb',
    displayTransform: ({ snvMissense, mutationBurden }): string => {
      const strings: string[] = [];
      if (snvMissense !== null && snvMissense !== undefined) strings.push(`${snvMissense} SNVs/exome`);
      if (mutationBurden !== null && mutationBurden !== undefined) strings.push(`${toFixed(mutationBurden, 2)} mut/mb`);
      return strings.join(' - ') || '-';
    },
  },
  {
    label: 'iPass Status',
    key: 'ipass',
    visible: false,
    settingKey: 'showIPASS',
    displayTransform: ({ ipassValue, ipassStatus }): string => {
      const displayStatus = ipassStatus ?? '';
      let displayValue = ipassValue ?? '';
      displayValue = displayValue !== '' && displayStatus ? `(${displayValue})` : displayValue;
      return `${displayStatus} ${displayValue}`.trim() || '-';
    },
  },
  {
    label: 'Purity',
    key: 'purity',
    visible: false,
    settingKey: 'showPurity',
    displayTransform: (value: number) => `${toFixed(value * 100, 0)}%`,
  },
  {
    label: 'Tumour',
    key: 'biosamples',
    visible: false,
    settingKey: 'showTumour',
    displayTransform: (value: IBiosample[] | undefined): string => (
      value
        ?.filter((biosample) => biosample.biosampleStatus === 'tumour')
        ?.map((biosample) => mapAssayName({
          sampleType: biosample.sampleType as SampleType,
          biosampleType: null,
        }))
        .join(', ') || '-'
    ),
  },
  {
    label: 'Germline',
    key: 'biosamples',
    visible: false,
    settingKey: 'showGermline',
    displayTransform: (value: IBiosample[] | undefined): string => (
      value
        ?.filter((biosample) => biosample.biosampleStatus === 'tumour')
        ?.map((biosample) => mapAssayName({
          sampleType: biosample.sampleType as SampleType,
          biosampleType: null,
        }))
        .join(', ') || '-'
    ),
  },
  {
    label: 'Enrolment',
    key: 'enrolmentDate',
    visible: true,
    settingKey: 'showEnrolment',
    displayTransform: (value: string): ReactNode => {
      const weeks = dayjs().diff(dayjs(value), 'week');
      return (
        weeks === 0
          ? 'Less than a week ago'
          : `${weeks} week${weeks === 1 ? '' : 's'} ago`
      );
    },
  },
  {
    label: 'Study',
    key: 'study',
    visible: false,
    settingKey: 'showStudy',
  },
  {
    label: 'MSI Status',
    key: 'msStatus',
    visible: false,
    settingKey: 'showMsiStatus',
  },
  {
    label: 'LOH Proportion',
    key: 'lohProportion',
    visible: false,
    settingKey: 'showLOH',
    displayTransform: (value: number) => (
      `${toFixed(value * 100, 2)} %`
    ),
  },
  {
    label: 'Zero2 Category',
    key: 'zero2Category',
    visible: false,
    settingKey: 'showCategory',
  },
  {
    label: 'Zero2 Subcategory 1',
    key: 'zero2Subcategory1',
    visible: false,
    settingKey: 'showCancerType',
  },
  {
    label: 'Zero2 Subcategory 2',
    key: 'zero2Subcategory2',
    visible: false,
    settingKey: 'showDiagnosis',
  },
  {
    label: 'Zero2 Final Diagnosis',
    key: 'zero2FinalDiagnosis',
    visible: false,
    settingKey: 'showFinalDiagnosis',
  },
  {
    label: 'Contamination',
    key: 'contamination',
    visible: false,
    settingKey: 'showContamination',
  },
  {
    label: 'Ploidy',
    key: 'ploidy',
    visible: false,
    settingKey: 'showPloidy',
  },
];
