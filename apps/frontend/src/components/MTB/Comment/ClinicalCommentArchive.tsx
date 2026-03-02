import useEvidences from '@/api/useEvidences';
import { useClinical } from '@/contexts/ClinicalContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IEvidenceLink } from '@/types/Evidence/Evidences.types';
import { Box } from '@mui/material';
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
import { clinicalCommentTags } from '../../../constants/Clinical/comments';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IClinicalCommentWithBody, IClinicalCommentsQuery, IUpdateClinicalCommentBody } from '../../../types/Comments/ClinicalComments.types';
import { CommentsArchiveListItem } from '../../ExpandedModal/Comments/CommentsArchiveListItem';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import ClinicalCommentsSearchFilter from './ClinicalCommentsSearchFilter';

interface IProps {
  selectedComments: IClinicalCommentWithBody[];
  onSelectClick: (comment: IClinicalCommentWithBody) => void;
  defaultFilters: IClinicalCommentsQuery;
  emptyFilters?: IClinicalCommentsQuery;
  editSelectedComment?: (
    commentId: string,
    body: Pick<IClinicalCommentWithBody, 'comment' | 'type' | 'evidence'>
  ) => void;
  beforeContent?: ReactNode;
  onShowEvidence?: (comment: IClinicalCommentWithBody) => void;
}

export default function ClinicalCommentArchive({
  selectedComments,
  onSelectClick,
  editSelectedComment,
  beforeContent,
  defaultFilters,
  emptyFilters,
  onShowEvidence,
}: IProps): JSX.Element {
  const { currentUser } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion } = useClinical();
  const { getClinicalEvidence } = useEvidences();

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<IClinicalCommentsQuery>(defaultFilters);

  const canHideComments = useIsUserAuthorised('clinical.sample.write');

  const getCount = useCallback(() => {
    zeroDashSdk.mtb.comment.getCommentsCount({
      ...filters,
    })
      .then((resp) => setTotalCount(resp));
  }, [filters, zeroDashSdk.mtb.comment]);

  const handleUpdate = async (
    comment: IClinicalCommentWithBody,
    body: IUpdateClinicalCommentBody,
    evidence?: string[],
    updateComment?: (value: IClinicalCommentWithBody) => void,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.comment.updateComment(comment.id, body);
      let evidenceLinks: IEvidenceLink[] = [];
      if (evidence) {
        await zeroDashSdk.mtb.evidence.updateEvidence({
          entityType: 'COMMENT',
          entityId: comment.id,
          externalIds: evidence,
        });
        evidenceLinks = (await getClinicalEvidence({
          evidenceLinkFilters: {
            entityTypes: ['COMMENT'],
            entityIds: [comment.id],
          },
        })).evidenceLinks;
      }
      if (updateComment) {
        const newComment = {
          ...comment,
          id: comment.id,
          comment: body.comment ?? comment.comment,
          isHiddenInArchive: body.isHidden ?? comment.isHiddenInArchive,
          type: body.type ?? comment.type,
          evidence: evidenceLinks,
        };
        updateComment(newComment);
      }
      if (editSelectedComment) {
        editSelectedComment(
          comment.id,
          {
            comment: body.comment ?? comment.comment,
            type: body.type ?? comment.type,
            evidence: evidenceLinks,
          },
        );
      }
    } catch {
      enqueueSnackbar('Could not update comment, please try again.', { variant: 'error' });
    }
  };

  const handleDelete = async (
    comment: IClinicalCommentWithBody,
    updateComment?: (value: IClinicalCommentWithBody) => void,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.comment.deleteComment(clinicalVersion.id, comment.id);
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

  const fetch = useCallback(async (page: number, limit: number) => {
    if (filters) {
      const resp = await zeroDashSdk.mtb.comment.getComments(
        filters || {},
        page,
        limit,
      );
      return resp.map((c) => ({
        ...c,
        comment: c.versions[0]?.comment || '',
      }));
    }
    return [];
  }, [filters, zeroDashSdk.mtb.comment]);

  const mapping = (
    item: IClinicalCommentWithBody,
    index: number,
    updateComment?: (value: IClinicalCommentWithBody) => void,
    // required for tab content wrapper
    setRefetch?: Dispatch<SetStateAction<boolean>>,
    isPrevAddedComment?: boolean,
  ): ReactNode => (
    item.id ? (
      <CommentsArchiveListItem
        key={item.id}
        // Selected selectedComments have created by / created at for this thread
        // This allows checking permissions for removing for this variant
        comment={selectedComments.find((c) => c.id === item.id) || item}
        onSelect={(): void => onSelectClick(item)}
        isSelected={selectedComments.some((c) => c.id === item.id)}
        isPrevAddedComment={isPrevAddedComment || false}
        permissions={{
          canAdd: true,
          canRemove: true,
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
        onDelete={(): Promise<void> => handleDelete(item, updateComment)}
        onHide={(isHidden): Promise<void> => handleUpdate(
          item,
          { isHidden },
          undefined,
          updateComment,
        )}
        tagOptions={clinicalCommentTags}
        onAddEvidence={(): void => {
          if (onShowEvidence) onShowEvidence(item);
        }}
      />
    ) : null
  );

  useEffect(() => {
    getCount();
  }, [getCount]);

  useEffect(() => {
    if (defaultFilters) {
      setFilters((prev) => (
        JSON.stringify(prev) !== JSON.stringify(defaultFilters)
          ? defaultFilters
          : prev
      ));
    }
  }, [defaultFilters]);

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <TabContentWrapper
        fetch={fetch}
        mapping={mapping}
        updateCount={(c): void => setCount(c)}
        beforeMappingContent={(
          <>
            {beforeContent}
            <Box position="sticky" top={0} zIndex={10}>
              <ClinicalCommentsSearchFilter
                filters={filters || {}}
                setFilters={setFilters}
                defaultFilters={defaultFilters || {}}
                emptyFilters={emptyFilters || {}}
                counts={{ current: count, total: totalCount }}
              />
            </Box>
          </>
        )}
      />
    </Box>
  );
}
