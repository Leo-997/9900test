import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import CustomTypography from '@/components/Common/Typography';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { formatInterpretationRTE } from '@/components/Reports/Common/HelperFunctions/formatInterpretation';
import { commonCommentTypes } from '@/constants/Common/comments';
import {
  germlineCommentTags, molecularCommentTags, snvCurationTemplate, variantInterpretationTag,
} from '@/constants/Curation/comments';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { IGene } from '@/types/Common.types';
import { useCuration } from '../../../contexts/CurationContext';
import { useReport } from '../../../contexts/Reports/CurrentReportContext';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import {
  CurationCommentTypes,
  CurationThreadTypes,
  GermlineCommentTypes,
  ICurationComment,
  ICurationCommentsQuery,
  ICurationCommentThread,
  IUpdateCurationCommentBody,
  MolecularCommentTypes,
} from '../../../types/Comments/CurationComments.types';
import { ISelectOption, VariantType } from '../../../types/misc.types';
import CustomButton from '../../Common/Button';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import { CommentCard } from './CommentCard';
import { AddCommentInput } from './Input/AddCommentInput';

const useStyles = makeStyles(() => ({
  mainContainer: {
    width: '100%',
    height: 'calc(100% - 48px)',
  },
  mainContainerEmpty: {
    backgroundColor: 'rgba(243, 245, 247, 0.5)',
  },
  hideLabel: {
    display: 'none',
  },
  noComments: {
    height: 'calc(100% - 200px)',
    paddingTop: 110,
    paddingLeft: 70,
    paddingRight: 70,
    textAlign: 'center',
    color: '#8292A6',
  },
  commentsList: {
    height: '100%',
    maxHeight: 'calc(100% - 200px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '24px 16px',
  },
  optionsButton: {
    borderRadius: '100%',
    minWidth: 0,
    width: 32,
    height: 32,
  },
}));

interface IProps {
  variantId: number | string;
  variantType: VariantType;
  biosampleId: string;
  type: ISelectOption<CurationThreadTypes>;
  handleExpandPanel: (
    defaultFilters: ICurationCommentsQuery,
    tab: ISelectOption<CurationThreadTypes>,
  ) => void;
  handleExpandEvidence?: (
    comment: ICurationComment,
    tab: ISelectOption<CurationThreadTypes>,
  ) => void;
  variantGenes?: IGene[];
}

export function CommentsTab({
  variantId,
  variantType,
  biosampleId,
  variantGenes,
  type,
  handleExpandPanel,
  handleExpandEvidence,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { currentUser } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
  } = useAnalysisSet();
  const {
    isAssignedClinician,
    setReportType,
    setSelectedReport,
  } = useReport();

  const [thread, setThread] = useState<ICurationCommentThread | null>();
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const canEditComment = useIsUserAuthorised('curation.sample.write') && !isReadOnly;
  const canEditMolecular = useIsUserAuthorised('report.molecular.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canEditGermline = useIsUserAuthorised('report.germline.content.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canEditCuration = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canReview = useIsUserAuthorised('common.sample.suggestion.write') && !isReadOnly;

  const defaultFilters = useMemo<ICurationCommentsQuery>(() => ({
    threadType: [type.value],
    type: type.value === 'MOLECULAR' ? [...commonCommentTypes] : undefined,
    genes: variantGenes?.filter((g) => g.gene !== 'INTERGENIC') || [],
    isHiddenInArchive: false,
  }), [type.value, variantGenes]);

  const getThread = useCallback(() => {
    zeroDashSdk.curationComments.getCommentThreads({
      entityType: [variantType],
      entityId: variantId.toString(),
      analysisSetIds: [analysisSet.analysisSetId],
      threadType: [type.value],
    }).then((resp) => setThread(resp.length ? resp[0] : null));
  }, [analysisSet.analysisSetId, type.value, variantId, variantType, zeroDashSdk.curationComments]);

  const createComment = async (
    comment: string,
    tag?: Exclude<CurationCommentTypes, CurationThreadTypes>,
    evidence?: string[],
  ): Promise<void> => {
    try {
      const id = await zeroDashSdk.curationComments.createComment(
        {
          comment,
          type: tag || type.value,
          threadType: type.value,
          entityId: variantId.toString(),
          entityType: variantType,
          analysisSetId: analysisSet.analysisSetId,
          biosampleId,
        },
      );
      if (evidence?.length) {
        await Promise.all(evidence.map((evidenceId) => (
          zeroDashSdk.curationEvidence.createNewEvidence({
            entityType: 'COMMENT',
            entityId: id,
            externalId: evidenceId,
          })
        )));
      }
      getThread();
    } catch {
      enqueueSnackbar('Could not create comment, please try again', { variant: 'error' });
    }
  };

  const handleUpdate = useCallback(async (
    commentId: string,
    body: IUpdateCurationCommentBody,
    evidence?: string[],
    threadId?: string,
  ) => {
    try {
      const newCommentId = await zeroDashSdk.curationComments.updateComment(
        commentId,
        body,
        threadId,
      );
      if (evidence) {
        await zeroDashSdk.curationEvidence.updateEvidence({
          entityId: newCommentId,
          entityType: 'COMMENT',
          externalIds: evidence,
        });
      }
    } catch {
      enqueueSnackbar('Could not update comment, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    zeroDashSdk.curationComments,
    zeroDashSdk.curationEvidence,
  ]);

  const handleDelete = async (commentId: string, threadId?: string): Promise<void> => {
    try {
      await zeroDashSdk.curationComments.deleteComment(
        commentId,
        threadId,
      );
      getThread();
    } catch {
      enqueueSnackbar('Could not remove comment from this variant, please try again', { variant: 'error' });
    }
  };

  const handleUpdateReportOrder = async (
    comment: ICurationComment,
    operation: 'new' | 'up' | 'down' | 'remove',
    threadId?: string,
  ): Promise<void> => {
    let newReportComments: ICurationComment[] = [
      ...(thread?.comments?.filter((c) => c.reportOrder) || []),
    ];
    const index = newReportComments.findIndex((c) => c.id === comment.id);
    if (operation === 'new') {
      newReportComments.push(comment);
    } else if (operation === 'remove') {
      newReportComments = newReportComments.filter((c) => c.id !== comment.id);
    } else if (operation === 'up' && index > 0) {
      [
        newReportComments[index - 1],
        newReportComments[index],
      ] = [
        newReportComments[index],
        newReportComments[index - 1],
      ];
    } else if (operation === 'down' && index < newReportComments.length - 1) {
      [
        newReportComments[index + 1],
        newReportComments[index],
      ] = [
        newReportComments[index],
        newReportComments[index + 1],
      ];
    }
    if (threadId) {
      try {
        await zeroDashSdk.curationComments.updateCommentReportOrder({
          threadId,
          order: newReportComments.map((c, i) => ({
            id: c.id,
            order: i + 1,
          })),
        });
        if (operation === 'remove') {
          await zeroDashSdk.curationComments.updateComment(
            comment.id,
            { reportOrder: null },
            threadId,
          );
        }
        getThread();
      } catch {
        enqueueSnackbar('Could not update the report order, please try again', { variant: 'error' });
      }
    }
  };

  const handleAddLineBreak = async (
    comment: ICurationComment,
    threadId: string,
  ): Promise<void> => {
    try {
      await zeroDashSdk.curationComments.updateComment(
        comment.id,
        { reportLineBreak: !comment.reportLineBreak },
        threadId,
      );
      getThread();
    } catch {
      enqueueSnackbar(`Could not ${comment.reportLineBreak ? 'remove' : 'add'} line break, please try again`, { variant: 'error' });
    }
  };

  const isReportsCommentType = (): boolean => (
    type.value === 'MOLECULAR' || type.value === 'GERMLINE'
  );

  const canWriteComment = useCallback((): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: canEditGermline || canEditCuration,
      CURATION: canEditCuration,
    };

    if (isReadOnly) return false;

    return scopeMap[type.value];
  }, [
    canEditComment,
    canEditCuration,
    canEditGermline,
    canEditMolecular,
    isReadOnly,
    type.value,
  ]);

  const canChangeReportOrder = (comment: ICurationComment): boolean => {
    const scopeMap: Record<Extract<CurationThreadTypes, 'MOLECULAR' | 'GERMLINE'>, boolean> = {
      MOLECULAR: canEditMolecular,
      GERMLINE: canEditGermline && comment.type !== 'VARIANT_INTERPRETATION',
    };
    return isReportsCommentType() && scopeMap[type.value];
  };

  // For germline, can only edit if:
  // 1. The comment is not a variant interpretation AND they're the assigned cancer geneticist
  // 2. The comment is a variant interpretation AND they're the assigned curator
  const canEdit = (comment: ICurationComment): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: (canEditGermline && comment.type !== 'VARIANT_INTERPRETATION')
        || (comment.type === 'VARIANT_INTERPRETATION' && canEditCuration),
      CURATION: canEditCuration,
    };

    // They wrote the comment
    // They have the correct role
    // Or this is the reports tab and they are an approver
    return comment.createdBy === currentUser?.id
      || scopeMap[type.value];
  };

  const canDeleteComment = (comment: ICurationComment): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: canEditGermline,
      CURATION: canEditCuration,
    };

    // Can remove your own comment from this variant
    // or can remove a comment from this variant if you have the scope perms
    return comment.createdBy === currentUser?.id
      || scopeMap[type.value];
  };

  const getTagOptions = useCallback((): ICommentTagOption<
    GermlineCommentTypes | MolecularCommentTypes
  >[] => {
    if (type.value === 'MOLECULAR') return molecularCommentTags;
    if (type.value === 'GERMLINE') {
      const tags: ICommentTagOption<GermlineCommentTypes | MolecularCommentTypes>[] = [];
      if (canEditCuration) {
        tags.push(variantInterpretationTag);
      }
      if (canEditGermline) {
        tags.push(...germlineCommentTags);
      }

      return tags;
    }
    return [];
  }, [type.value, canEditCuration, canEditGermline]);

  const getInitalText = (): string | undefined => {
    if (['SNV', 'GERMLINE_SNV'].includes(variantType) && type.value === 'CURATION') {
      return snvCurationTemplate;
    }
    return undefined;
  };

  useEffect(() => {
    getThread();
  }, [getThread]);

  useEffect(() => {
    setReportType(type.value === 'GERMLINE' ? 'GERMLINE_REPORT' : 'MOLECULAR_REPORT');
    setSelectedReport(null);
  }, [setReportType, setSelectedReport, type.value]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      className={classes.mainContainer}
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        style={{ padding: '8px' }}
      >
        <CustomButton
          variant="text"
          size="small"
          label={`View ${type.name} Archive`}
          endIcon={<ArrowRightIcon />}
          onClick={(): void => handleExpandPanel(
            defaultFilters,
            type,
          )}
        />
        {['MOLECULAR', 'GERMLINE'].includes(type.value) && (
          <CustomButton
            variant="text"
            label={`${showPreview ? 'Hide' : 'Show'} report preview`}
            size="small"
            startIcon={showPreview ? <EyeOffIcon /> : <EyeIcon />}
            onClick={(): void => setShowPreview((prev) => !prev)}
          />
        )}
      </Box>
      {showPreview && (
        <Box padding="8px" borderBottom="1px solid #E7ECF0">
          <RichTextEditor
            title={(
              <CustomTypography variant="h6" fontWeight="bold">
                Report Preview
              </CustomTypography>
            )}
            key={formatInterpretationRTE(thread?.comments?.filter((c) => c.reportOrder))}
            initialText={formatInterpretationRTE(
              thread?.comments?.filter((c) => c.reportOrder),
              type.value === 'GERMLINE' ? '\n\n' : '',
            )}
            mode="readOnly"
            commentMode="readOnly"
            hideComments
            condensed
          />
        </Box>
      )}
      {(thread?.comments?.length || 0) > 0 && (
        <ScrollableSection className={classes.commentsList}>
          {thread?.comments
            ?.sort((a, b) => {
              if (a.reportOrder === b.reportOrder) {
                return dayjs(b.createdAt).diff(a.createdAt);
              }
              return (a.reportOrder || Infinity) - (b.reportOrder || Infinity);
            })
            ?.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={{
                  ...comment,
                  comment: comment.versions?.[0]?.comment ?? '',
                  thread,
                }}
                isReadOnly={isReadOnly}
                actions={{
                  addToReport: true,
                  edit: true,
                  order: true,
                  delete: true,
                  evidence: true,
                  review: false,
                }}
                permissions={{
                  addToReport: canChangeReportOrder(comment),
                  edit: canEdit(comment),
                  hide: canEdit(comment),
                  order: canChangeReportOrder(comment),
                  delete: canDeleteComment(comment),
                  evidence: canEdit(comment),
                  review: canReview,
                }}
                onEdit={(body, evidence, threadId): Promise<void> => handleUpdate(
                  comment.id,
                  body,
                  evidence,
                  threadId,
                )}
                onDelete={(): void => {
                  handleDelete(comment.id, thread.id);
                }}
                onChangeOrder={(operation): void => {
                  handleUpdateReportOrder(
                    comment,
                    operation,
                    thread.id,
                  );
                }}
                onAddEvidence={(): void => {
                  if (handleExpandEvidence) handleExpandEvidence(comment, type);
                }}
                onAddLineBreak={() => {
                  handleAddLineBreak(comment, thread.id);
                }}
                showOrder={isReportsCommentType()}
                tagOptions={getTagOptions()}
              />
            ))}
        </ScrollableSection>
      )}
      {(thread === null || thread?.comments?.length === 0) && (
        <div className={classes.noComments}>
          <CustomTypography variant="bodyRegular">
            Looks like you don&apos;t have anything
            <br />
            for this variant yet
          </CustomTypography>
        </div>
      )}
      {thread === undefined && (
        <LoadingAnimation />
      )}
      <Box padding="16px">
        <AddCommentInput
          key={`${type.value}-${canWriteComment() ? getInitalText() : ''}`}
          handleSubmit={(comment, tag, evidence) => {
            createComment(comment, tag, evidence);
          }}
          showTags={isReportsCommentType()}
          tagOptions={getTagOptions()}
          readonly={!canWriteComment()}
          initialText={canWriteComment() ? getInitalText() : undefined}
        />
      </Box>
    </Box>
  );
}
