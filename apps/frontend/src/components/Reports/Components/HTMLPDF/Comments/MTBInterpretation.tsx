import AlterationChip from '@/components/Chips/AlterationChip';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import ClinicalCommentArchive from '@/components/MTB/Comment/ClinicalCommentArchive';
import MolAlterationsSelectModal from '@/components/MTB/Views/Components/Slides/GenerateSlides/MolAlterationsSelectModal';
import { getDraftedCommentId } from '@/components/Reports/Common/HelperFunctions/getDraftedComment';
import { useClinical } from '@/contexts/ClinicalContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { zccTheme } from '@/themes/zccTheme';
import { IClinicalComment, IClinicalCommentWithBody } from '@/types/Comments/ClinicalComments.types';
import { IGene } from '@/types/Common.types';
import { IInterpretation } from '@/types/MTB/Interpretations.types';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import {
  Box, IconButton,
  TextField,
} from '@mui/material';
import {
  ArrowDownIcon, ArrowUpIcon,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState, type JSX } from 'react';
import GeneralReportComment from './TextBox/GeneralReportCommentInput';

interface IProps {
  interpretation: IInterpretation;
  onOrder?: (operation: 'up' | 'down') => void;
  onUpdate?: (interpretation: IInterpretation) => void;
  onDelete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function MTBInterpretation({
  interpretation,
  onOrder,
  onUpdate,
  onDelete,
  isFirst,
  isLast,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser } = useUser();
  const {
    isGeneratingReport,
    isAssignedClinician,
    isAssignedCurator,
    isReadOnly,
    reportType,
  } = useReport();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();

  const clinicalComment: IClinicalComment | null = useMemo(
    () => interpretation.comments[0] ?? null,
    [interpretation.comments],
  );
  const clinicalCommentWithBody = useMemo(
    () => (
      clinicalComment?.versions[0]?.comment
        ? {
          ...clinicalComment,
          comment: clinicalComment.versions[0].comment,
        } as IClinicalCommentWithBody
        : null
    ),
    [clinicalComment],
  );

  const draftedCommentId = useMemo<string>(() => getDraftedCommentId(
    interpretation.id,
    clinicalCommentWithBody?.id,
  ), [clinicalCommentWithBody?.id, interpretation.id]);

  const [altModalOpen, setAltModalOpen] = useState<boolean>(false);

  const canEditInterpretations = useIsUserAuthorised(
    'report.mtb.write',
    isAssignedCurator,
    isAssignedClinician,
  ) && !isReadOnly;

  const handleDelete = useCallback(async (): Promise<void> => {
    const threads = await zeroDashSdk.mtb.comment.getCommentThreads({
      clinicalVersionId: clinicalVersion.id,
      threadType: ['REPORTS'],
      entityType: ['INTERPRETATION'],
      entityId: interpretation.id,
    });
    const thread = threads[0];
    if (thread && interpretation.comments) {
      // Delete all comments in this thread
      await Promise.all(interpretation.comments?.map((c) => (
        zeroDashSdk.mtb.comment.deleteComment(c.id, thread.id)
      )));

      // Delete the thread
      await zeroDashSdk.mtb.comment.deleteCommentThread(thread.id);
    }

    // Delete the interpretation
    await zeroDashSdk.mtb.interpretations.deleteInterpretation(
      clinicalVersion.id,
      interpretation.id,
    );
    if (onDelete) onDelete();
  }, [clinicalVersion.id,
    interpretation.comments,
    interpretation.id,
    onDelete, zeroDashSdk.mtb.comment,
    zeroDashSdk.mtb.interpretations,
  ]);

  const updateTitle = useCallback(async (title: string) => {
    await zeroDashSdk.mtb.interpretations.updateInterpretation(
      clinicalVersion.id,
      interpretation.id,
      {
        title,
      },
    );

    if (onUpdate) {
      onUpdate({
        ...interpretation,
        title,
      });
    }
  }, [clinicalVersion.id, interpretation, onUpdate, zeroDashSdk.mtb.interpretations]);

  const handleUpdate = useCallback(async (
    newComment: string,
    evidence?: string[],
    threadId?: string,
  ) => {
    let newCommentId = clinicalCommentWithBody?.id;
    if (!clinicalCommentWithBody) {
      // create the first version
      newCommentId = await zeroDashSdk.mtb.comment.createComment(
        {
          comment: newComment,
          thread: {
            clinicalVersionId: clinicalVersion.id,
            entityId: interpretation.id,
            entityType: 'INTERPRETATION',
            threadType: 'REPORTS',
          },
          type: 'CLINICAL_INTERPRETATION',
        },
      );
    } else if (threadId) {
      // duplicate and save
      newCommentId = await zeroDashSdk.mtb.comment.updateComment(
        clinicalCommentWithBody.id,
        { comment: newComment },
        threadId,
      );
    } else {
      // update original
      const latestVersion = clinicalCommentWithBody.versions[0];
      if (latestVersion?.createdBy === currentUser?.id) {
        await zeroDashSdk.mtb.comment.updateCommentVersion(
          clinicalCommentWithBody.id,
          latestVersion.id,
          { comment: newComment },
        );
      } else {
        await zeroDashSdk.mtb.comment.createCommentVersion(
          clinicalCommentWithBody.id,
          {
            comment: newComment,
          },
        );
      }
    }
    const threads = await zeroDashSdk.mtb.comment.getCommentThreads(
      {
        clinicalVersionId: clinicalVersion.id,
        entityId: interpretation.id,
        entityType: ['INTERPRETATION'],
        threadType: ['REPORTS'],
      },
    );
    // Check if there is evidence as part of this new update and update db accordingly
    if (evidence && newCommentId) {
      await zeroDashSdk.mtb.evidence.updateEvidence({
        entityId: newCommentId,
        externalIds: evidence,
        entityType: 'COMMENT',
      });
    }
    if (onUpdate) {
      onUpdate({
        ...interpretation,
        comments: threads[0]?.comments || [],
      });
    }
  }, [
    clinicalCommentWithBody,
    zeroDashSdk.mtb.evidence,
    clinicalVersion.id,
    currentUser?.id,
    interpretation,
    onUpdate,
    zeroDashSdk.mtb.comment,
  ]);

  const updateTargets = useCallback(async (alterations?: IMolecularAlterationDetail[]) => {
    if (!alterations || !interpretation.molAlterationGroupId) return;
    await zeroDashSdk.mtb.molAlteration.updateMolAlterationsGroup(
      clinicalVersion.id,
      interpretation.molAlterationGroupId,
      alterations.map((a) => a.id),
    );
    setAltModalOpen(false);
    if (onUpdate) {
      onUpdate({
        ...interpretation,
        targets: alterations,
      });
    }
  }, [clinicalVersion.id, interpretation, onUpdate, zeroDashSdk.mtb.molAlteration]);

  const addFromArchive = useCallback(async (newComment: IClinicalCommentWithBody) => {
    handleUpdate(
      newComment.comment,
      newComment.evidence?.map((e) => e.externalId),
      clinicalCommentWithBody?.thread?.id,
    );
    onUpdate?.(interpretation);
    enqueueSnackbar('Updated the comment from archive.', { variant: 'success' });
  }, [
    handleUpdate,
    clinicalCommentWithBody?.thread?.id,
    onUpdate,
    interpretation,
    enqueueSnackbar,
  ]);

  return (
    <Box
      id={`report-comment-${draftedCommentId}`}
      width="100%"
      display="flex"
      flexDirection="column"
    >
      <GeneralReportComment
        key={draftedCommentId}
        draftedCommentId={draftedCommentId}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        comment={clinicalCommentWithBody ?? undefined}
        disabled={!canEditInterpretations}
        isInterpretation
        withCommentVersions
        archive={(
          <ClinicalCommentArchive
            selectedComments={[]}
            onSelectClick={addFromArchive}
            defaultFilters={{
              threadType: ['REPORTS'],
              entityType: ['INTERPRETATION'],
              type: ['CLINICAL_INTERPRETATION'],
              interpretationReportType: [reportType],
              isHiddenInArchive: false,
              genes: interpretation.targets
                ?.flatMap((t) => {
                  const genes: IGene[] = [];
                  if (t.gene && t.geneId) {
                    genes.push({
                      gene: t.gene,
                      geneId: Number(t.geneId),
                    });
                  }
                  if (t.secondaryGene && t.secondaryGeneId) {
                    genes.push({
                      gene: t.secondaryGene,
                      geneId: Number(t.secondaryGeneId),
                    });
                  }
                  return genes;
                })
                .filter((elem, index, self) => (
                  self.findIndex((e) => e.geneId === elem.geneId) === index
                ))
                .filter((t) => t.gene !== 'INTERGENIC'),
            }}
            emptyFilters={{
              threadType: ['REPORTS'],
              entityType: ['INTERPRETATION'],
              type: ['CLINICAL_INTERPRETATION'],
              interpretationReportType: [reportType],
            }}
          />
        )}
        title={(
          <Box
            width="100%"
            display="flex"
            gap="8px"
            alignItems="center"
          >
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              gap="8px"
            >
              {isGeneratingReport || !canEditInterpretations ? (
                <CustomTypography variant="bodySmall" fontWeight="bold" style={{ marginBottom: '0px' }}>
                  {interpretation.title}
                </CustomTypography>
              ) : (
                <TextField
                  key={`${interpretation.id}-title`}
                  disabled={!canEditInterpretations}
                  variant="standard"
                  fullWidth
                  defaultValue={interpretation.title}
                  onBlur={(e): Promise<void> => updateTitle(e.target.value as string)}
                  multiline
                  slotProps={{
                    input: {
                      sx: {
                        ...zccTheme.typography.bodySmall,
                        fontWeight: 'bold',
                      },
                    },
                  }}
                />
              )}
            </Box>
            {!isGeneratingReport && (
              <>
                <IconButton
                  disabled={!canEditInterpretations || isLast}
                  onClick={(): void => {
                    if (onOrder) {
                      onOrder('down');
                    }
                  }}
                >
                  <ArrowDownIcon />
                </IconButton>
                <IconButton
                  disabled={!canEditInterpretations || isFirst}
                  onClick={(): void => {
                    if (onOrder) {
                      onOrder('up');
                    }
                  }}
                >
                  <ArrowUpIcon />
                </IconButton>
              </>
            )}
          </Box>
        )}
        alterationSection={
          !isGeneratingReport && reportType === 'MTB_REPORT' && (
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              paddingBottom="4px"
              gap="8px"
            >
              <Box
                display="flex"
                alignItems="center"
                columnGap="8px"
                rowGap="4px"
                flexWrap="wrap"
              >
                {interpretation.targets?.map((t) => (
                  <AlterationChip
                    key={t.id}
                    alteration={t}
                    mutationType={t.mutationType}
                  />
                ))}
                <CustomButton
                  label="Manage"
                  variant="text"
                  size="small"
                  disabled={!canEditInterpretations}
                  onClick={(): void => setAltModalOpen(true)}
                />
              </Box>
            </Box>
          )
        }
      />
      {altModalOpen && (
        <MolAlterationsSelectModal
          open={altModalOpen}
          onClose={(): void => setAltModalOpen(false)}
          alterations={interpretation?.targets}
          onSave={updateTargets}
          isNewSlide={false}
        />
      )}
    </Box>
  );
}
