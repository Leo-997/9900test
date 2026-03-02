import { Menu, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ICurationComment } from '@/types/Comments/CurationComments.types';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { IReport } from '@/types/Reports/Reports.types';
import { StageName, StageStatus } from '@/types/TaskDashboard/TaskDashboard.types';
import UpdateCaseDetailsModal from './UpdateCaseDetailsModal';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  curationData: IAnalysisSet;
  updateCurationData?: (data: IAnalysisSet) => void;
  updateReport: (newReport: IReport) => void;
  clinicalData: IClinicalDashboardSample | null;
  molecularReport: IReport | null;
  germlineReport: IReport | null;
  mtbReport: IReport | null;
  currentNotes: ICurationComment | null;
  setNotes: Dispatch<SetStateAction<ICurationComment | null>>;
  canCloseCase: boolean;
}

export function TaskListItemMenu({
  anchorEl,
  setAnchorEl,
  curationData,
  updateCurationData,
  updateReport,
  clinicalData,
  molecularReport,
  germlineReport,
  mtbReport,
  currentNotes,
  setNotes,
  canCloseCase,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [isTaskMenuModalOpen, setIsTaskMenuModalOpen] = useState<boolean>(false);

  const isReadOnly = useIsPatientReadOnly({
    analysisSetId: curationData.analysisSetId,
  });
  const canEditCuration = useIsUserAuthorised('curation.sample.write') && !isReadOnly;
  const canEditClinical = useIsUserAuthorised('clinical.sample.write') && !isReadOnly;
  const canEditTask = canEditCuration || canEditClinical;

  const updateCaseDetails = async (
    stage?: StageName,
    newStatus?: StageStatus,
    newNotes?: string,
  ): Promise<void> => {
    try {
    // UPDATE STATUS
      if (stage && newStatus) {
        if (stage === 'Curation') {
          await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
            curationData.analysisSetId,
            { pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null },
          );
          if (updateCurationData) {
            updateCurationData({
              ...curationData,
              pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null,
            });
          }
        }

        if (stage === 'MTB Slides' && clinicalData) {
          await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
            clinicalData.clinicalVersionId,
            {
              pseudoStatus: newStatus === 'N/A' || newStatus === 'On Hold' ? newStatus : null,
            },
          );
          if (updateCurationData) {
            updateCurationData({
              ...curationData,
              clinicalData: curationData.clinicalData ? {
                ...curationData.clinicalData,
                pseudoStatus: newStatus === 'N/A' || newStatus === 'On Hold' ? newStatus : null,
              } : curationData.clinicalData,
            });
          }
        }

        if (stage === 'Molecular Report' && molecularReport) {
          await zeroDashSdk.services.reports.updateReport(
            molecularReport.id,
            { pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null },
          );
          updateReport({
            ...molecularReport,
            pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null,
          });
        }

        if (stage === 'Germline Report' && germlineReport) {
          await zeroDashSdk.services.reports.updateReport(
            germlineReport.id,
            { pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null },
          );
          updateReport({
            ...germlineReport,
            pseudoStatus: newStatus === 'On Hold' ? 'On Hold' : null,
          });
        }

        if (stage === 'MTB Report' && mtbReport) {
          await zeroDashSdk.services.reports.updateReport(
            mtbReport.id,
            { pseudoStatus: newStatus === 'On Hold' || newStatus === 'N/A' ? newStatus : null },
          );
          updateReport({
            ...mtbReport,
            pseudoStatus: newStatus === 'On Hold' || newStatus === 'N/A' ? newStatus : null,
          });
        }

        if (stage === 'Case Status') {
          await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
            curationData.analysisSetId,
            { finaliseCase: true },
          );
          if (updateCurationData) {
            updateCurationData({
              ...curationData,
              caseFinalisedAt: dayjs().format('YYYY/MM/DD HH:mm:ss'),
            });
          }
        }
      }
      // UPDATE CASE NOTES
      if (newNotes !== currentNotes?.versions?.[0]?.comment) {
        if (currentNotes) {
          if (newNotes) {
            // Update old note with newNotes
            await zeroDashSdk.curationComments.updateComment(
              currentNotes.id,
              { comment: newNotes },
            );
            setNotes((prev) => (prev ? { ...prev, comment: newNotes } : null));
          } else {
            // newNotes is empty text => Soft delete old note
            await zeroDashSdk.curationComments.deleteComment(
              currentNotes.id,
              currentNotes.thread?.id,
            );
            setNotes(null);
          }
        } else if (!currentNotes && newNotes) {
          // There is no old note or was soft-deleted => Create a new note
          const newCommentId = await zeroDashSdk.curationComments.createComment({
            comment: newNotes,
            type: 'NOTES',
            threadType: 'ANALYSIS',
            entityType: 'ANALYSIS',
            entityId: curationData.analysisSetId,
            analysisSetId: curationData.analysisSetId,
          });

          const createdNotes = await zeroDashSdk.curationComments.getCommentById(newCommentId);
          setNotes(createdNotes);
        }
      }
      enqueueSnackbar('Case details were succesfully updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('There was an issue updating the case', { variant: 'error' });
    }
  };

  const handleCurationExpedite = async (): Promise<void> => {
    try {
      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        curationData.analysisSetId,
        { expedite: curationData.expedite ? !curationData.expedite : true },
      );
      if (updateCurationData) {
        updateCurationData({
          ...curationData,
          expedite: curationData.expedite ? !curationData.expedite : true,
        });
      }
    } catch {
      enqueueSnackbar('Could not update analysis set, please try again.', { variant: 'error' });
    }
  };

  return (
    <>
      <Menu
        id="task-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        variant="menu"
        disableRestoreFocus
        keepMounted
      >
        <MenuItem
          disabled={!canEditTask}
          onClick={(): void => {
            setIsTaskMenuModalOpen(true);
            setAnchorEl(null);
          }}
        >
          Update case details
        </MenuItem>

        <MenuItem
          disabled={!canEditCuration}
          onClick={(): void => {
            handleCurationExpedite();
            setAnchorEl(null);
          }}
        >
          {curationData.expedite ? 'Cancel expedite status' : 'Expedite'}
        </MenuItem>
      </Menu>
      {isTaskMenuModalOpen && (
        <UpdateCaseDetailsModal
          key="task-menu-modal"
          curationData={curationData}
          molecularReport={molecularReport}
          germlineReport={germlineReport}
          mtbReport={mtbReport}
          clinicalData={clinicalData}
          currentNotes={currentNotes?.versions?.[0]?.comment || ''}
          isOpen={isTaskMenuModalOpen}
          setIsOpen={setIsTaskMenuModalOpen}
          onSubmit={updateCaseDetails}
          canCloseCase={canCloseCase}
        />
      )}
    </>
  );
}
