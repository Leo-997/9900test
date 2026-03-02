import {
  Box, Grid, styled,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { ChevronDownIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  type JSX,
} from 'react';
import useEvidences from '@/api/useEvidences';
import CustomDialog from '@/components/Common/CustomDialog';
import CurationEvidenceArchive from '@/components/Evidence/Archive/CurationEvidenceArchive';
import CommentsQuickFilters from '@/components/SearchFilterBar/QuickFilters/CommentsQuickFilters';
import { germlineCommentTags, molecularCommentTags } from '@/constants/Curation/comments';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { CommonCommentTypes, ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { IEvidenceLink } from '@/types/Evidence/Evidences.types';
import { useCuration } from '../../../contexts/CurationContext';
import { useReport } from '../../../contexts/Reports/CurrentReportContext';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import {
  CurationCommentTypes,
  CurationThreadEntityTypes,
  CurationThreadTypes,
  GermlineCommentTypes,
  ICurationCommentsQuery,
  ICurationCommentWithBody,
  IUpdateCurationCommentBody,
  MolecularCommentTypes,
} from '../../../types/Comments/CurationComments.types';
import { IApproval } from '../../../types/Reports/Approvals.types';
import CustomTypography from '../../Common/Typography';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import { CommentsArchiveListItem } from './CommentsArchiveListItem';
import CommentsSearchFilter from './SearchFilter/CommentsSearchFilter';

const StickyHeader = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.colours.core.grey30,
  zIndex: 1,
  width: '100%',
  padding: '8px 16px',
}));

const useStyles = makeStyles(() => createStyles({
  accordion: {

    '&:hover': {
      cursor: 'pointer',
    },
  },
  accordionShowHide: {
    fontSize: '12px',
    display: 'inline',
    marginRight: '6px',
  },
  arrowUpIcon: {
    transform: 'rotate(180deg)',
  },
  tabContentWrapper: {
    maxHeight: '100%',
    overflowX: 'hidden',
    flex: '1 1 auto',

    '& .simplebar-scrollbar': {
      top: 0,
    },
  },
  commentsHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#F3F5F7',
    zIndex: 1,
    width: '100%',
    padding: '8px 16px',
  },
}));

interface IProps<T extends CurationCommentTypes = CommonCommentTypes> {
  variantId?: number | string;
  variantType: CurationThreadEntityTypes;
  biosampleId?: string;
  type: CurationThreadTypes;
  defaultFilters: ICurationCommentsQuery;
  // This needs to be provided as a useCallback as it is used as a dependency
  onSelectComment?: (comment: ICurationCommentWithBody) => Promise<void>;
  tagOptions?: ICommentTagOption<T>[];
  includeTagQuickFilters?: boolean;
}

export function CommentsArchive<T extends CurationCommentTypes = CommonCommentTypes>({
  variantId,
  variantType,
  biosampleId,
  type,
  defaultFilters,
  onSelectComment,
  tagOptions,
  includeTagQuickFilters,
}: IProps<T>): JSX.Element {
  const classes = useStyles();
  const { currentUser } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { isReadOnly, isAssignedCurator } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
  } = useAnalysisSet();
  const {
    approvals,
    isAssignedClinician,
  } = useReport();
  const { getCurationEvidence } = useEvidences();

  const [variantComments, setVariantComments] = useState<ICurationCommentWithBody[]>([]);
  const [selectedComments, setSelectedComments] = useState<ICurationCommentWithBody[]>([]);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<ICurationCommentsQuery>(defaultFilters);
  const [
    evidenceArchiveComment,
    setEvidenceArchiveComment,
  ] = useState<ICurationCommentWithBody | null>(null);
  const [showAllComments, setShowAllComments] = useState<boolean>(false);

  const canEditComment = useIsUserAuthorised('curation.sample.write');
  const canEditMolecular = useIsUserAuthorised('report.molecular.write', isAssignedCurator, isAssignedClinician);
  const canEditGermline = useIsUserAuthorised('report.germline.write', isAssignedCurator, isAssignedClinician);
  const canEditCuration = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);
  const canHideComments = (
    canEditComment
    || (type === 'GERMLINE' && canEditGermline)
    || (type === 'MOLECULAR' && canEditMolecular)
    || (type === 'CURATION' && canEditCuration)
  );

  const getVariantComments = useCallback(async (): Promise<void> => {
    try {
      const resp = await zeroDashSdk.curationComments.getComments({
        ...filters,
        entityType: [variantType],
        entityId: variantId ? variantId.toString() : undefined,
        threadType: [type],
      });
      const comments = resp.map((c) => ({
        ...c,
        comment: c.versions[0]?.comment || '',
      }));

      setVariantComments(comments);
    } catch {
      enqueueSnackbar('Could not fetch comments, please try again', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    type,
    variantId,
    variantType,
    zeroDashSdk.curationComments,
    filters,
  ]);

  const getSelectedComments = useCallback(async (): Promise<void> => {
    try {
      const threads = await zeroDashSdk.curationComments.getCommentThreads({
        entityType: [variantType],
        entityId: variantId ? variantId.toString() : undefined,
        analysisSetIds: [analysisSet.analysisSetId],
        threadType: [type],
      });
      if (threads.length > 0) {
        const comments = await zeroDashSdk.curationComments.getCommentsInThread(
          threads[0].id,
        );
        setSelectedComments(comments.map((c) => ({
          ...c,
          comment: c.versions[0]?.comment || '',
          thread: threads[0],
        })));
        return;
      }
      setSelectedComments([]);
    } catch {
      enqueueSnackbar('Could not fetch comments, please try again', { variant: 'error' });
    }
  }, [
    analysisSet.analysisSetId,
    enqueueSnackbar,
    type,
    variantId,
    variantType,
    zeroDashSdk.curationComments,
  ]);

  const getCount = useCallback(() => {
    zeroDashSdk.curationComments.getCommentsCount({
      ...filters,
    })
      .then((resp) => setTotalCount(resp));
  }, [
    zeroDashSdk.curationComments,
    filters,
  ]);

  const fetch = useCallback(async (
    page: number,
    limit: number,
  ): Promise<ICurationCommentWithBody[]> => {
    if (!showAllComments) return [];

    const resp = await zeroDashSdk.curationComments.getComments(
      {
        ...filters,
      },
      page,
      limit,
    );

    return resp.map((c) => ({
      ...c,
      comment: c.versions[0]?.comment || '',
    }));
  }, [filters, showAllComments, zeroDashSdk.curationComments]);

  const handleSelectComment = useCallback(async (
    comment: ICurationCommentWithBody,
  ): Promise<void> => {
    if (onSelectComment) {
      await onSelectComment(comment);
    } else {
      const selectedComment = selectedComments.find((c) => c.id === comment.id);
      if (selectedComment && selectedComment.thread) {
        await zeroDashSdk.curationComments.deleteComment(
          selectedComment.id,
          selectedComment.thread.id,
        );
      } else if (!selectedComment) {
        await zeroDashSdk.curationComments.linkCommentToThread(
          comment.id,
          {
            threadType: type,
            entityType: variantType,
            entityId: variantId?.toString(),
            analysisSetId: analysisSet.analysisSetId,
            biosampleId,
          },
        );
      }
    }
    getSelectedComments();
    getVariantComments();
  }, [
    onSelectComment,
    analysisSet.analysisSetId,
    getSelectedComments,
    selectedComments,
    type,
    variantId,
    variantType,
    biosampleId,
    getVariantComments,
    zeroDashSdk.curationComments,
  ]);

  const handleUpdate = async (
    comment: ICurationCommentWithBody,
    body: IUpdateCurationCommentBody,
    evidence?: string[],
    updateComment?: (value: ICurationCommentWithBody) => void,
  ): Promise<void> => {
    try {
      const newCommentId = await zeroDashSdk.curationComments.updateComment(comment.id, body);
      let evidenceLinks: IEvidenceLink[] = [];
      if (evidence) {
        await zeroDashSdk.curationEvidence.updateEvidence({
          entityId: newCommentId,
          entityType: 'COMMENT',
          externalIds: evidence,
        });
        evidenceLinks = (await getCurationEvidence({
          evidenceLinkFilters: {
            entityTypes: ['COMMENT'],
            entityIds: [newCommentId],
          },
        })).evidenceLinks;
      }

      const newComment = {
        ...comment,
        id: newCommentId,
        comment: body.comment ?? comment.comment,
        isHiddenInArchive: body.isHidden ?? comment.isHiddenInArchive,
        type: body.type ?? comment.type,
        evidence: evidenceLinks,
      };
      setSelectedComments((prev) => prev.map((c) => (
        c.id === newCommentId ? newComment : c
      )));
      if (updateComment) {
        updateComment(newComment);
      }
    } catch {
      enqueueSnackbar('Could not update comment, please try again.', { variant: 'error' });
    }
  };

  const handleDelete = async (
    comment: ICurationCommentWithBody,
    updateComment?: (value: ICurationCommentWithBody) => void,
  ): Promise<void> => {
    try {
      await zeroDashSdk.curationComments.deleteComment(comment.id);
      if (updateComment) {
        updateComment({
          ...comment,
          id: '', // indicates that the comment is deleted
        });
      }
    } catch {
      enqueueSnackbar('Could not update comment, please try again.', { variant: 'error' });
    }
  };

  const isReportApprover = (): boolean => (
    approvals
      .filter((a) => a.status === 'pending')
      .some((a: IApproval) => a.assigneeId === currentUser?.id)
  );

  const canAddToVariant = (): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: canEditGermline,
      CURATION: canEditCuration,
    };

    if (isReadOnly) return false;

    // They have the correct role
    // Or this is the reports tab and they are an approver
    return scopeMap[type] || (
      (type === 'MOLECULAR' || type === 'GERMLINE') && isReportApprover()
    );
  };

  const canRemoveFromVariant = (
    comment: ICurationCommentWithBody,
  ): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: canEditGermline,
      CURATION: canEditCuration,
    };

    if (isReadOnly) return false;

    // Can remove your own comment from this variant
    // or can remove a comment from this variant if you have the scope perms
    return comment.createdBy === currentUser?.id || scopeMap[type];
  };

  const getTagOptions = (): ICommentTagOption<
    GermlineCommentTypes | MolecularCommentTypes
  >[] => {
    if (type === 'MOLECULAR') return molecularCommentTags;
    if (type === 'GERMLINE') return germlineCommentTags;
    return [];
  };

  const mapping = (
    item: ICurationCommentWithBody,
    index: number,
    updateComment?: (value: ICurationCommentWithBody) => void,
    // required for tab content wrapper
    setRefetch?: Dispatch<SetStateAction<boolean>>,
    isPrevAddedComment?: boolean,
  ): ReactNode => (
    item.id ? (
      <CommentsArchiveListItem
        key={item.id}
        // Selected comments have created by / created at for this thread
        // This allows checking permissions for removing for this variant
        comment={selectedComments.find((c) => c.id === item.id) || item}
        onSelect={() => { handleSelectComment(item); }}
        isSelected={selectedComments.some((c) => c.id === item.id)}
        isPrevAddedComment={isPrevAddedComment || false}
        permissions={{
          canAdd: canAddToVariant(),
          canRemove: canRemoveFromVariant(item),
          edit: item.originalCreatedBy === currentUser?.id,
          hide: item.originalCreatedBy === currentUser?.id,
          delete: item.originalCreatedBy === currentUser?.id,
        }}
        canHideComments={canHideComments}
        onEdit={(body, evidence): Promise<void> => handleUpdate(
          item,
          body,
          evidence,
          updateComment,
        )}
        onDelete={() => { handleDelete(item, updateComment); }}
        onHide={(isHidden) => {
          handleUpdate(
            item,
            { isHidden },
            undefined,
            updateComment,
          );
        }}
        onAddEvidence={(): void => setEvidenceArchiveComment(item)}
        tagOptions={tagOptions || getTagOptions() as ICommentTagOption<T>[]}
      />
    ) : null
  );

  const beforeContent = (): ReactNode => (
    <>
      <StickyHeader>
        <CustomTypography
          variant="label"
        >
          Previously added to this variant / report
        </CustomTypography>
      </StickyHeader>
      {variantComments?.map((c, index) => mapping(c, index, undefined, undefined, true))}
      <StickyHeader
        container
        direction="row"
        justifyContent="space-between"
        className={classes.accordion}
        onClick={(): void => setShowAllComments((prev) => !prev)}
      >
        <Grid>
          <CustomTypography
            variant="label"
          >
            All comments
          </CustomTypography>
        </Grid>
        <Grid style={{ display: 'flex', alignItems: 'center' }}>
          <CustomTypography
            variant="bodySmall"
            fontWeight="bold"
            className={classes.accordionShowHide}
          >
            {showAllComments ? 'Hide' : 'Show'}
          </CustomTypography>
          <ChevronDownIcon
            style={{
              transform: showAllComments ? 'rotate(180deg)' : undefined,
              transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
            }}
          />
        </Grid>
      </StickyHeader>
    </>
  );

  useEffect(() => {
    getVariantComments();
  }, [getVariantComments]);

  useEffect(() => {
    getCount();
  }, [getCount]);

  useEffect(() => {
    getSelectedComments();
  }, [getSelectedComments]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CommentsSearchFilter
        searchPlaceholder="Search and add previous comments"
        quickFilters={(
          <CommentsQuickFilters
            includeTagFilters={includeTagQuickFilters}
            toggled={filters}
            setToggled={setFilters}
            type={type}
            defaultFilters={defaultFilters}
          />
        )}
        counts={{ current: count, total: totalCount }}
        filters={filters || {}}
        setFilters={setFilters}
        defaultFilters={defaultFilters}
        tagOptions={tagOptions || getTagOptions()}
      />
      <TabContentWrapper
        beforeMappingContent={beforeContent()}
        fetch={fetch}
        mapping={mapping}
        className={classes.tabContentWrapper}
        updateCount={(c): void => setCount(c)}
        customEmptyContent={showAllComments ? undefined : ' '}
      />
      {evidenceArchiveComment && (
        <CustomDialog
          title="Add evidence"
          content={(
            <CurationEvidenceArchive
              comment={evidenceArchiveComment}
              showResources={false}
              canSelectEvidence={evidenceArchiveComment.originalCreatedBy === currentUser?.id}
            />
          )}
          open={Boolean(evidenceArchiveComment)}
          onClose={(): void => setEvidenceArchiveComment(null)}
        />
      )}
    </Box>
  );
}
