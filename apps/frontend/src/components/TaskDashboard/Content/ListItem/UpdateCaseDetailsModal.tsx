import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import Gender from '@/components/VitalStatus/Gender';
import { updateCaseDetailsStatusOptions } from '@/constants/options';
import { taskDashboardStageOptions } from '@/constants/TaskDashboard/stages';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { ISelectOption } from '@/types/misc.types';
import { IReport } from '@/types/Reports/Reports.types';
import { StageName, StageStatus, TaskDashboardStage } from '@/types/TaskDashboard/TaskDashboard.types';
import {
  Box,
  MenuItem,
  Select,
  styled,
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useRef, useState, type JSX } from 'react';

const InputWrapper = styled(Box)({
  '& .comment-editor': {
    maxHeight: '130px',
  },
});

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '230px',
  '& .MuiSelect-icon': {
    color: theme.colours.core.offBlack100,
  },
  '& .MuiSelect-select:focus': {
    backgroundColor: theme.colours.core.white,
    color: theme.colours.core.offBlack100,
  },
  '& .MuiSelect-select:hover': {
    backgroundColor: theme.colours.core.white,
    color: theme.colours.core.offBlack100,
  },
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  flexDirection: 'row',
  gap: '8px',
  height: '44px',
}));

interface IProps {
  curationData: IAnalysisSet;
  molecularReport: IReport | null;
  germlineReport: IReport | null;
  mtbReport: IReport | null;
  clinicalData: IClinicalDashboardSample | null;
  currentNotes: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: (
    stage?: StageName,
    newStatus?: StageStatus,
    comment?: string,
  ) => Promise<void>;
  canCloseCase: boolean;
}

export default function UpdateCaseDetailsModal({
  curationData,
  molecularReport,
  germlineReport,
  mtbReport,
  clinicalData,
  currentNotes,
  isOpen,
  setIsOpen,
  onSubmit,
  canCloseCase,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedStage, setSelectedStage] = useState<StageName>();
  const [selectedStatus, setSelectedStatus] = useState<StageStatus>();
  const [newNotes, setNewNotes] = useState<string>(currentNotes);

  const editorRef = useRef<IRTERef | null>(null);

  const canAddClinicalComments = useIsUserAuthorised('clinical.sample.write');
  const canAddCurationComments = useIsUserAuthorised('curation.sample.write');

  const canAddNotes = (): boolean => (canAddCurationComments || canAddClinicalComments);

  const handleValidation = async (): Promise<void> => {
    try {
      onSubmit(
        selectedStage,
        selectedStatus,
        newNotes,
      );
      setIsOpen(false);
    } catch (e) {
      enqueueSnackbar('Failed to update case details, please try again', { variant: 'error' });
      console.error(e);
    }
  };

  const checkDisabled = (): boolean => (
    (!selectedStage || !selectedStatus)
    && (newNotes === currentNotes)
  );

  const getStatuses = (): ISelectOption<StageStatus>[] => {
    const stageMap: Record<StageName, IAnalysisSet | IReport | IClinicalDashboardSample | null> = {
      'Case Status': null,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Curation: curationData,
      'Germline Report': germlineReport,
      'MTB Report': mtbReport,
      'MTB Slides': clinicalData,
      'Molecular Report': molecularReport,
    };

    if (selectedStage) {
      let options = updateCaseDetailsStatusOptions;
      const stageData = stageMap[selectedStage];
      const currentStatus = stageData && (
        ('curationStatus' in stageData && stageData.curationStatus)
        || ('clinicalStatus' in stageData && stageData.clinicalStatus)
        || ('status' in stageData && stageData.status)
      );

      const pseudoStatus = stageData?.pseudoStatus;

      if (!pseudoStatus) {
        options = options.filter((o) => o.value !== 'Remove Hold');
      }
      if (selectedStage !== 'Case Status') {
        options = options.filter((o) => o.name !== 'Done');
      }
      if (!['MTB Slides', 'MTB Report'].includes(selectedStage)) {
        options = options.filter((o) => o.name !== 'Mark as N/A');
      }
      if (selectedStage === 'Case Status') {
        options = options.filter((o) => o.name === 'Done');
      }

      return options
        .map((o) => ({
          ...o,
          name: currentStatus
            ? o.name.replace('{status}', currentStatus)
            : o.name,
        }));
    }
    return [];
  };

  const getStageOptions = (option: ISelectOption<TaskDashboardStage>): JSX.Element => {
    const { name } = option;
    let tooltipText = '';

    // Is a report option and there is no report created
    // or is germline report option and there was a prev issued report
    if (
      (name === 'Molecular Report' && !molecularReport)
      || (name === 'Germline Report' && !germlineReport)
      || (name === 'MTB Report' && !mtbReport)
    ) {
      tooltipText = 'Report status cannot be updated until after report is created';
    }
    // Is mtb slides option and there is no clinical data
    if (name === 'MTB Slides' && !clinicalData) {
      tooltipText = 'Clinical status cannot be updated before Curation is finalised';
    }
    // Stage is completed
    // or germline report data is null but there is a prev issued report
    if ((name === 'Curation' && curationData.curationStatus === 'Done')
      || (name === 'Molecular Report' && molecularReport?.status === 'approved')
      || (name === 'Germline Report' && (germlineReport?.status === 'approved'))
      || (name === 'MTB Report' && mtbReport?.status === 'approved')
      || (name === 'MTB Slides' && clinicalData?.clinicalStatus === 'Done')) {
      tooltipText = 'Cannot update status for completed stages';
    }

    // If we wrap valid options with a tooltip
    // The option will no longer be selectable
    return tooltipText ? (
      <Tooltip title={tooltipText}>
        <span>
          <StyledMenuItem
            key={name}
            value={name}
            disabled
          >
            <CustomTypography
              variant="bodyRegular"
              width="100%"
            >
              {name}
            </CustomTypography>
          </StyledMenuItem>
        </span>
      </Tooltip>
    ) : (
      <StyledMenuItem
        key={name}
        value={name}
        disabled={Boolean(tooltipText)}
      >
        <CustomTypography
          variant="bodyRegular"
          width="100%"
        >
          {name}
        </CustomTypography>
      </StyledMenuItem>
    );
  };

  return (
    <CustomModal
      title="Update case status"
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      buttonText={{ confirm: 'Add comment and update status' }}
      confirmDisabled={checkDisabled()}
      onConfirm={handleValidation}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {/* MODAL TITLE */}
          <CustomTypography variant="titleRegular" fontWeight="medium">
            {curationData.patientId}
            : Update status
          </CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="10px"
          >
            <CustomTypography display="inline">
              Patient Id:
              &nbsp;
              {curationData.patientId}
            </CustomTypography>
            {curationData.vitalStatus && (
              <Gender vitalStatus={curationData.vitalStatus} gender={curationData.gender} />
            )}
          </Box>
          {/* STAGE & STATUS */}
          <Box
            display="flex"
            gap="50px"
            width="100%"
          >
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                STAGE
              </CustomTypography>
              <StyledSelect
                variant="outlined"
                MenuProps={{
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  PaperProps: {
                    sx: {
                      paddingTop: 0,
                      paddingBottom: 0,
                      borderRadius: 2,
                    },
                  },
                }}
                onChange={(e): void => {
                  setSelectedStage(e.target.value as StageName);
                }}
                disabled={!canAddCurationComments}
              >
                {taskDashboardStageOptions.map((option) => getStageOptions(option))}
              </StyledSelect>
            </Box>
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                STATUS
              </CustomTypography>
              <StyledSelect
                key="case-status-select"
                variant="outlined"
                MenuProps={{
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  PaperProps: {
                    sx: {
                      paddingTop: 0,
                      paddingBottom: 0,
                      borderRadius: 2,
                    },
                  },
                }}
                onChange={(e): void => {
                  setSelectedStatus(e.target.value as StageStatus);
                }}
                disabled={!selectedStage || !canAddCurationComments}
              >
                {getStatuses().map((option) => (
                  <StyledMenuItem
                    key={option.value}
                    value={option.value}
                    disabled={option.name === 'Done' && !canCloseCase}
                  >
                    <CustomTypography
                      variant="bodyRegular"
                      truncate
                    >
                      {option.name}
                    </CustomTypography>
                  </StyledMenuItem>
                ))}
              </StyledSelect>
            </Box>
          </Box>
          {/* NOTES */}
          {canAddNotes() && (
            <InputWrapper display="flex" width="100%">
              <RichTextEditor
                ref={editorRef}
                classNames={{
                  editor: 'comment-editor',
                }}
                title={(
                  <CustomTypography variant="label">
                    NOTES *
                  </CustomTypography>
                  )}
                initialText={currentNotes}
                mode="autoSave"
                disablePlugins={['table', 'evidence', 'inline-citation']}
                onChange={
                    (value): void => setNewNotes(editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value))
                  }
              />
            </InputWrapper>
          )}
        </Box>
      )}
    />
  );
}
