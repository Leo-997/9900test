import { createStyles, makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  ReactNode, useCallback, useMemo, type JSX,
} from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useEvidences from '../../../api/useEvidences';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '../../../hooks/useIsUserAuthorised';
import { Evidence } from '../../../types/Evidence/Evidences.types';
import { VariantType } from '../../../types/misc.types';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import EvidenceListItem from './ListItems/EvidenceListItem';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

const useStyles = makeStyles(() => createStyles({
  root: {
    flexGrow: 1,
    height: 'calc(100% - 42px)',
    width: '95%',
    overflowX: 'hidden',
  },
  noData: {
    height: '100%',
    paddingLeft: '10%',
    paddingRight: '10%',
    paddingTop: '20%',
  },
  noDataText: {
    color: '#8292A6',
    textAlign: 'center',
    marginTop: '15px',
  },
}));

interface IEvidenceListProps {
  variantId: string | number;
  variantType: VariantType;
}

function EvidenceList({ variantId, variantType }: IEvidenceListProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { getBiosampleForVariantType } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({
    biosampleId: getBiosampleForVariantType(variantType)?.biosampleId,
  });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { getAllEvidence } = useEvidences();
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
  } = useAnalysisSet();

  const canDownload = useIsUserAuthorised('evidence.download');
  const canDelete = useIsUserAuthorised('curation.evidence.write', isAssignedCurator);

  const permissions = useMemo(() => ({
    delete: !isReadOnly && canDelete,
    download: canDownload,
  }), [canDelete, canDownload, isReadOnly]);

  const getEvidencesBySample = useCallback(
    async (page: number, limit: number): Promise<Evidence[]> => {
      if (analysisSet.analysisSetId) {
        const evidence = await zeroDashSdk.curationEvidence.getEvidence(
          {
            analysisSetId: analysisSet.analysisSetId,
            entityIds: [typeof variantId === 'number' ? variantId.toString() : variantId],
            entityTypes: [variantType],
          },
        );

        if (evidence.length > 0) {
          const { allEvidence } = await getAllEvidence({
            evidenceDetailsFilters: {
              ids: evidence.map((e) => e.externalId),
              page,
              limit,
            },
          });

          return allEvidence
            .map((e) => ({
              ...e,
              internalEvidenceId: evidence.find(
                (curationEvidence) => curationEvidence.externalId === e.evidenceId,
              )?.evidenceId,
            }));
        }
      }
      return [];
    },
    [
      analysisSet.analysisSetId,
      getAllEvidence,
      variantId,
      variantType,
      zeroDashSdk.curationEvidence,
    ],
  );

  // returns a boolean to indicate that the list item was deleted
  const handleDeleteEvidence = async (
    evidenceId: string,
  ): Promise<boolean> => {
    try {
      await zeroDashSdk.curationEvidence.deleteEvidence(evidenceId);
      enqueueSnackbar('Evidence unlinked successfully', { variant: 'success' });
      return true;
    } catch {
      enqueueSnackbar('Could not delete evidence, please try again', { variant: 'error' });
      return false;
    }
  };

  const mapping = (
    evidence: Evidence,
    index: number,
    updateItem?: (ev: Evidence) => void,
  ): ReactNode => (
    evidence.id
      ? (
        <EvidenceListItem
          key={`${evidence.internalEvidenceId}-${index}`}
          evidence={evidence}
          onDelete={(evidenceId) => {
            handleDeleteEvidence(
              evidenceId,
            ).then((deleted) => {
              if (deleted && updateItem) {
                updateItem({
                  ...evidence,
                  id: '',
                });
              }
            });
          }}
          permissions={permissions}
        />
      ) : null
  );

  return (
    <TabContentWrapper
      fetch={getEvidencesBySample}
      mapping={mapping}
      className={classes.root}
    />
  );
}

export default EvidenceList;
