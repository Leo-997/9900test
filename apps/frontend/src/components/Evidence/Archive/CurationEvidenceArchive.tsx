import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import useEvidences from '../../../api/useEvidences';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { ICurationComment } from '../../../types/Comments/CurationComments.types';
import {
  Evidence,
  EvidenceEntityTypes,
  IEvidenceLink,
} from '../../../types/Evidence/Evidences.types';
import { VariantType } from '../../../types/misc.types';
import { ReportType } from '../../../types/Reports/Reports.types';
import CustomTypography from '../../Common/Typography';
import EvidenceListItem from '../EvidenceList/ListItems/EvidenceListItem';
import EvidenceArchive from './EvidenceArchive';

const useStyles = makeStyles(() => ({
  stickySearch: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  evidenceHeader: {
    position: 'sticky',
    top: '132px',
    backgroundColor: '#F3F5F7',
    zIndex: 1,
    width: '100%',
    padding: '8px 16px',
  },
  tabContentWrapper: {
    height: 'calc(100% - 172px)',
    overflowX: 'hidden',

    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .simplebar-scrollbar': {
      top: 0,
    },
  },
}));

interface IBaseProps {
  showResources?: boolean;
  previouslyAddedSectionHeader?: string;
  canSelectEvidence?: boolean;
  onSelectEvidence?: (item: Evidence) => void;
}

interface IVariantProps extends IBaseProps {
  variantId: number | string;
  variantType: VariantType | ReportType;
  biosampleId: string;
  // allows finding previously added evidence for only variant type
  // useful for reports where there is no variant id
  ignoreVariantId?: boolean;
  comment?: never;
}

interface ICommentProps extends IBaseProps {
  comment: ICurationComment;
  variantId?: never;
  variantType?: never;
  ignoreVariantId?: never;
  biosampleId?: string;
}

type Props = ICommentProps | IVariantProps;

export default function CurationEvidenceArchive({
  variantId,
  variantType,
  biosampleId,
  comment,
  showResources = true,
  previouslyAddedSectionHeader,
  ignoreVariantId = false,
  canSelectEvidence = false,
  onSelectEvidence,
}: Props): JSX.Element {
  const classes = useStyles();
  const { analysisSet } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { createNewCurationEvidence, getCurationEvidence } = useEvidences();

  // evidence for this variant from all samples or evidence for this comment
  // This will have the data from the microservice
  const [prevAddedEvidence, setPrevAddedEvidence] = useState<Evidence[] | null>(null);
  // evidence added to this sample or comment
  const [selectedEvidence, setSelectedEvidence] = useState<IEvidenceLink[]>([]);

  const getVariantEvidence = useCallback(
    async () => {
      try {
        if (variantType) {
          setPrevAddedEvidence(null);
          const { evidenceLinks, allEvidence } = await getCurationEvidence({
            evidenceLinkFilters: {
              entityIds: ignoreVariantId ? undefined : [typeof variantId === 'number' ? variantId.toString() : variantId],
              entityTypes: [variantType],
            },
          });
          setSelectedEvidence(
            evidenceLinks.filter((e) => e.analysisSetId === analysisSet.analysisSetId),
          );
          return allEvidence;
        }
      } catch (error) {
        enqueueSnackbar('Could not fetch evidence for this variant, please try again.', { variant: 'error' });
      }

      return [];
    },
    [
      getCurationEvidence,
      ignoreVariantId,
      variantId,
      variantType,
      analysisSet.analysisSetId,
      enqueueSnackbar,
    ],
  );

  const isEvidenceSelected = (item: Evidence): boolean => (
    selectedEvidence.some((e) => e.externalId === item.evidenceId)
  );

  const handleUnpickEvidence = async (item: Evidence): Promise<void> => {
    const internalId = selectedEvidence.find((e) => e.externalId === item.evidenceId)?.evidenceId;
    if (internalId) {
      try {
        await zeroDashSdk.curationEvidence.deleteEvidence(internalId);
        setSelectedEvidence((prev) => prev.filter((e) => e.externalId !== item.evidenceId));
        if (comment) {
          // for comment evidence, prev added evidence essentially mirrors what is selected
          // for variant evidence, prev added could include stuff added to old samples
          // so it is difficult to track what should be in this list
          setPrevAddedEvidence((prev) => (
            prev ? prev.filter((e) => e.evidenceId !== item.evidenceId) : prev
          ));
        }
      } catch {
        enqueueSnackbar('Could not remove evidence, please try again', { variant: 'error' });
      }
    }
  };

  const handlePickEvidence = async (item: Evidence): Promise<void> => {
    if (isEvidenceSelected(item)) {
      await handleUnpickEvidence(item);
    } else {
      const newEvidence = {
        entityId: variantId?.toString() || comment?.id || '',
        entityType: variantType || 'COMMENT' as EvidenceEntityTypes,
        externalId: item.evidenceId,
        analysisSetId: variantType ? analysisSet.analysisSetId : undefined,
        biosampleId,
      };

      if (currentUser?.id) {
        const id = await createNewCurationEvidence(newEvidence);

        setSelectedEvidence((prev) => ([
          ...prev,
          {
            evidenceId: id,
            createdAt: dayjs().toISOString(),
            createdBy: currentUser.id,
            ...newEvidence,
          },
        ]));

        if (comment) {
          // for comment evidence, prev added evidence essentially mirrors what is selected
          // for variant evidence, prev added could include stuff added to old samples
          // so it is difficult to track what should be in this list
          setPrevAddedEvidence((prev) => (
            prev ? [
              ...prev,
              item,
            ] : prev
          ));
        }
      }
    }
    if (onSelectEvidence) onSelectEvidence(item);
  };

  const getEvidenceLinks = useCallback(async (evidenceLinkFilters): Promise<Evidence[]> => (
    getCurationEvidence({ evidenceLinkFilters })
      .then((resp) => resp.allEvidence)
  ), [getCurationEvidence]);

  useEffect(() => {
    if (comment?.id) {
      setPrevAddedEvidence(null);
      getCurationEvidence({
        evidenceLinkFilters: {
          entityIds: [comment.id],
          entityTypes: ['COMMENT'],
        },
      })
        .then(({ evidenceLinks, allEvidence }) => {
          setSelectedEvidence(evidenceLinks);
          setPrevAddedEvidence(allEvidence);
        });
    }
  }, [
    comment?.id,
    getCurationEvidence,
  ]);

  useEffect(() => {
    getVariantEvidence();
  }, [getVariantEvidence]);

  const mapping = (item: Evidence): JSX.Element => (
    <EvidenceListItem
      key={item.id}
      evidence={item}
      onSelect={handlePickEvidence}
      isSelected={isEvidenceSelected(item)}
      allowDeselecting
      canSelect={canSelectEvidence}
    />
  );

  const beforeContent = (): ReactNode => (
    <>
      {variantType && (
        <CustomTypography
          variant="label"
          className={classes.evidenceHeader}
        >
            {
              previouslyAddedSectionHeader
              || `${
                showResources ? 'Patient resources + ' : ''
              }Evidence previously added to this variant`
            }
        </CustomTypography>
      )}
      {comment && (
        <CustomTypography
          variant="label"
          className={classes.evidenceHeader}
        >
          Evidence linked to this comment
        </CustomTypography>
      )}
      {prevAddedEvidence?.map(mapping)}
      <CustomTypography
        variant="label"
        className={classes.evidenceHeader}
        style={{ zIndex: 2 }}
      >
        All evidence
      </CustomTypography>
    </>
  );

  return (
    <EvidenceArchive
      classNames={{ searchFilter: classes.stickySearch }}
      handlePickEvidence={handlePickEvidence}
      getEvidenceLinks={getEvidenceLinks}
      initialFilters={comment ? { type: 'CITATION' } : undefined}
      contentAfterSearch={beforeContent()}
      selectedEvidenceIds={selectedEvidence.map((e) => e.externalId)}
      allowDeselecting
      canSelectEvidence={canSelectEvidence}
    />
  );
}
