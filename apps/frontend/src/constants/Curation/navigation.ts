import { FinaliseHTSCurationModal } from '@/components/WorkflowModals/FinaliseHTSCurationModal';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IHTSCulture } from '@/types/HTS.types';
import { FinaliseCurationModal } from '../../components/WorkflowModals/FinaliseCurationModal';
import WarningPopup from '../../components/WorkflowModals/WarningPopup';
import {
  CurationStatus,
  FailedStatusReason,
  HtsStatus,
  ICurrentCurationStatus,
  ICurrentStatus,
  SecondaryCurationStatus,
} from '../../types/Samples/Sample.types';

type CurationStatuses = {
  [key in CurationStatus]: ICurrentCurationStatus;
}

type SecondaryCurationStatuses = {
  [key in SecondaryCurationStatus]: ICurrentStatus<SecondaryCurationStatus, IAnalysisSet>;
}

type HtsStatuses = {
  [key in HtsStatus]: ICurrentStatus<HtsStatus, IHTSCulture[]>;
}

export const curationStatuses: CurationStatuses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Sequencing: {
    status: 'Sequencing',
    chipProps: {
      status: 'Sequencing',
      color: corePalette.grey200,
      backgroundColor: corePalette.grey30,
    },
    readonly: true,
    nextStatuses: [
      {
        status: 'Ready to Start',
        label: 'Ready to Start',
        scope: 'curation.status.write',
      },
      {
        status: 'In Pipeline',
        label: 'In Pipeline',
        scope: 'curation.status.write',
      },
    ],
  },
  'In Pipeline': {
    status: 'In Pipeline',
    chipProps: {
      status: 'In Pipeline',
      color: corePalette.grey200,
      backgroundColor: corePalette.grey30,
    },
    readonly: true,
    nextStatuses: [
      {
        status: 'Ready to Start',
        label: 'Ready to Start',
        scope: 'curation.status.write',
      },
    ],
  },
  'Ready to Start': {
    status: 'Ready to Start',
    chipProps: {
      status: 'Ready',
      color: corePalette.green300,
      backgroundColor: corePalette.green10,
    },
    readonly: false,
    nextStatuses: [
      {
        status: 'In Progress',
        label: 'Start Curation',
        scope: 'curation.sample.assigned.write',
        modal: WarningPopup,
        secondaryStatus: 'Not Started',
      },
    ],
  },
  'In Progress': {
    status: 'In Progress',
    chipProps: {
      status: 'In Progress',
      color: corePalette.blue300,
      backgroundColor: corePalette.blue30,
    },
    readonly: false,
    nextStatuses: [
      {
        status: 'Done',
        label: 'Finalise Curation',
        scope: 'curation.sample.assigned.write',
        modal: FinaliseCurationModal,
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Done: {
    status: 'Done',
    chipProps: {
      status: 'Done',
      color: corePalette.grey100,
      backgroundColor: corePalette.grey50,
    },
    readonly: false,
    nextStatuses: [
      {
        status: 'Done',
        label: 'Re-export clinical data',
        scope: 'curation.sample.assigned.write',
        modal: FinaliseCurationModal,
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Failed: {
    status: 'Failed',
    chipProps: {
      status: 'Failed',
      color: corePalette.red200,
      backgroundColor: corePalette.red10,
    },
    readonly: true,
    nextStatuses: [],
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Withdrawn: {
    status: 'Withdrawn',
    chipProps: {
      status: 'Withdrawn',
      color: corePalette.grey100,
      backgroundColor: corePalette.grey50,
    },
    readonly: false,
    nextStatuses: [],
  },
};

export const failedStatusReasons: FailedStatusReason[] = ['Contaminated Germline', 'No Donor', 'No Tumour'];

export const secondaryCurationStatuses: SecondaryCurationStatuses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Not Started': {
    status: 'Not Started',
    canProgress: (analysisSet?: IAnalysisSet) => analysisSet?.curationStatus === 'In Progress',
    nextStatus: {
      status: 'In Progress',
      label: 'Send for Review',
    },
    readonly: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'In Progress': {
    status: 'In Progress',
    canProgress: () => true,
    nextStatus: {
      status: 'Completed',
      label: 'Complete Review',
    },
    readonly: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Completed: {
    status: 'Completed',
    canProgress: () => false,
    readonly: true,
  },
};

export const htsStatuses: HtsStatuses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Not Started': {
    status: 'Not Started',
    canProgress: () => true,
    nextStatus: {
      status: 'In Progress',
      label: 'Start HTS Curation',
    },
    readonly: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'In Progress': {
    status: 'In Progress',
    canProgress: (cultures) => (
      Boolean(cultures?.every((c) => c.screenStatus === 'PASS' || c.screenStatus === 'FAIL'))
    ),
    nextStatus: {
      status: 'Completed',
      label: 'Complete HTS Curation',
      modal: FinaliseHTSCurationModal,
    },
    readonly: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Completed: {
    status: 'Completed',
    canProgress: () => false,
    readonly: true,
  },
};
