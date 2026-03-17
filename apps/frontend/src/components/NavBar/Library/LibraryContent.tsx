import { Box, styled } from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import React, {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import { CustomTabs } from '@/components/Common/Tabs';
import CreateNewEvidenceModal from '@/components/Evidence/Modals/CreateNewEvidenceModal';
import { resourceInputOptions } from '@/constants/Common/evidence';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import useEvidences from '../../../api/useEvidences';
import { useCuration } from '../../../contexts/CurationContext';
import { usePatient } from '../../../contexts/PatientContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IEvidenceLink, IResourceWithEvidence, isResource } from '../../../types/Evidence/Evidences.types';
import { IResourceWithMeta } from '../../../types/Evidence/Resources.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomButton from '../../Common/Button';
import CustomTypography from '../../Common/Typography';
import LibraryResourceList from '../../Evidence/EvidenceList/LibraryResourceList';
import SearchBar from '../../Search/SearchBar';

const Wrapper = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%',
  marginBottom: '14px',
  borderRadius: '0px 4px 4px 4px',
  boxSizing: 'border-box',
  alignItems: 'center',
  gap: '16px',
}));

const ResourceListContainer = styled(Box)(() => ({
  height: 'calc(100% - 100px)',
  overflow: 'auto',
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const StyledCustomTypography = styled(CustomTypography)(() => ({
  marginBottom: 16,
  marginTop: 32,
  fontWeight: 500,
}));

const StyledSearchBar = styled(SearchBar)(({ theme }) => ({
  ...theme.typography.body2,
  position: 'relative',
  borderRadius: '4px',
  boxSizing: 'border-box',
  boxShadow: 'none',
  backgroundColor: '#FFFFFF',
  width: '100% !important',
}));

const AddBtn = styled(CustomButton)(() => ({
  marginBottom: '20px',
  width: '100%',
}));

interface ILibraryContentProps {
  refetch: boolean;
  onViewResource: (resource: IResourceWithMeta) => void;
  setRefetch: (state: boolean) => void;
}

function LibraryContent({
  refetch,
  setRefetch,
  onViewResource,
}: ILibraryContentProps): JSX.Element {
  const { patient } = usePatient();
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();
  const { isReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const {
    getCurationEvidence,
    createNewCurationEvidence,
  } = useEvidences();

  const [resources, setResources] = useState<IResourceWithEvidence[]>([]);
  const [evidenceLinks, setEvidenceLinks] = useState<IEvidenceLink[]>([]);
  const [patientSamples, setPatientSamples] = useState<string[]>([]);
  const [resourcesCategory, setResourcesCategory] = useState<'ALL' | 'CURRENT_SAMPLE'>('CURRENT_SAMPLE');
  const [resourceAddOpen, setResourceAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>();

  const canCreateResources = useIsUserAuthorised('curation.evidence.write');

  const getResourcesByPatient = useCallback(async (query?: string): Promise<void> => {
    try {
      if (patient?.patientId) {
        const { evidenceLinks: newEvidenceLinks, allEvidence } = await getCurationEvidence({
          evidenceLinkFilters: { patientId: patient.patientId },
          evidenceDetailsFilters: { type: 'RESOURCE' },
          searchQuery: query,
        });
        setPatientSamples(
          newEvidenceLinks.map((e) => e.analysisSetId || '')
            .filter((sample, index, samples) => sample && (index === samples.indexOf(sample))),
        );
        setResources(allEvidence.filter((e) => isResource(e)));
        setEvidenceLinks(newEvidenceLinks);
      }
    } catch {
      if (analysisSet.analysisSetId) {
        enqueueSnackbar('Could not fetch patient resources', { variant: 'error' });
      }
    }
    setRefetch(false);
  }, [
    patient?.patientId,
    getCurationEvidence,
    analysisSet.analysisSetId,
    enqueueSnackbar,
    setRefetch,
  ]);

  const getResourcesBySample = useCallback(async (query?: string): Promise<void> => {
    try {
      if (analysisSet.analysisSetId) {
        const { evidenceLinks: newEvidenceLinks, allEvidence } = await getCurationEvidence({
          evidenceLinkFilters: { analysisSetId: analysisSet.analysisSetId },
          evidenceDetailsFilters: { type: 'RESOURCE' },
          searchQuery: query,
        });
        setPatientSamples(
          newEvidenceLinks.map((e) => e.analysisSetId || '')
            .filter((sample, index, samples) => sample && (index === samples.indexOf(sample))),
        );
        setResources(allEvidence.filter((e) => isResource(e)));
        setEvidenceLinks(newEvidenceLinks);
      }
    } catch {
      if (analysisSet.analysisSetId) {
        enqueueSnackbar('Could not fetch sample resources', { variant: 'error' });
      }
    }
    setRefetch(false);
  }, [analysisSet.analysisSetId, getCurationEvidence, enqueueSnackbar, setRefetch]);

  const handleDeleteResource = async (evidenceId: string): Promise<void> => {
    try {
      await zeroDashSdk.curationEvidence.deleteEvidence(evidenceId);
      const newResources = resources.filter((r) => r.internalEvidenceId !== evidenceId);
      setResources(newResources);
    } catch {
      enqueueSnackbar('Could not delete resource, please try again', { variant: 'error' });
    }
  };

  const handleUpdateResource = (
    resourceId: string,
    newResource: IResourceWithEvidence,
  ): void => {
    setResources((prev) => prev.map((resource) => (
      resource.id === resourceId
        ? newResource
        : resource
    )));
  };

  const addEvidenceToLibrary = useCallback((evidenceId: string) => {
    if (analysisSet.analysisSetId) {
      createNewCurationEvidence(
        { externalId: evidenceId, analysisSetId: analysisSet.analysisSetId },
      ).then(() => setRefetch(true));
    }
  }, [analysisSet.analysisSetId, createNewCurationEvidence, setRefetch]);

  useEffect(() => {
    if (refetch) {
      if (resourcesCategory === 'CURRENT_SAMPLE') {
        getResourcesBySample(searchQuery);
      } else {
        getResourcesByPatient(searchQuery);
      }
    }
  }, [
    getResourcesByPatient,
    getResourcesBySample,
    resourcesCategory,
    refetch,
    searchQuery,
  ]);

  useEffect(() => {
    setRefetch(true);
  }, [resourcesCategory, setRefetch]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Wrapper>
        <Box display="flex" width="100%">
          <CustomTabs
            variant="sub-navigation"
            size="medium"
            fullWidth
            sx={{ width: '100%' }}
            tabs={[{ label: 'Current sample', value: 'CURRENT_SAMPLE' }, { label: 'All samples', value: 'ALL' }]}
            value={resourcesCategory}
            onChange={(e, tab): void => setResourcesCategory(tab)}
          />
        </Box>
        <StyledSearchBar
          placeholder="Search library"
          ignoreStyles
          searchMethod={(query): void => {
            setSearchQuery(query);
            setRefetch(true);
          }}
        />
        <ResourceListContainer>
          {refetch && (
            <LoadingAnimation />
          )}
          {(!refetch && resources.length > 0) && (
            patientSamples.map((sampleId) => (
              <React.Fragment key={sampleId}>
                {resourcesCategory === 'ALL' && (
                  <StyledCustomTypography variant="h5">
                    {sampleId}
                  </StyledCustomTypography>
                )}
                <LibraryResourceList
                  listItems={
                    resources
                      .filter((r) => (
                        evidenceLinks
                          .filter((e) => e.analysisSetId === sampleId)
                          .some((e) => e.externalId === r.evidenceId)
                      ))
                    }
                  onViewResource={onViewResource}
                  onDeleteResource={handleDeleteResource}
                  onUpdateResource={handleUpdateResource}
                  isReadOnly={resourcesCategory === 'ALL' || isReadOnly}
                />
              </React.Fragment>
            ))
          )}
          {(!refetch && resources.length === 0) && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              width="100%"
            >
              <CustomTypography variant="bodyRegular" style={{ color: '#8292A6', textAlign: 'center' }}>
                No resources found for this
                {' '}
                {resourcesCategory === 'ALL' ? 'patient' : 'sample'}
                .
                <br />
              </CustomTypography>
            </Box>
          )}
        </ResourceListContainer>
      </Wrapper>

      {resourcesCategory === 'CURRENT_SAMPLE' && !isReadOnly && canCreateResources && (
        <div>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            padding="8px"
          >
            <AddBtn
              variant="outline"
              label="Add New Resource"
              onClick={(): void => setResourceAdd(true)}
              startIcon={<PlusIcon />}
            />
          </Box>
          <CreateNewEvidenceModal
            onSubmit={addEvidenceToLibrary}
            open={resourceAddOpen}
            onClose={(): void => setResourceAdd(false)}
            inputOptions={resourceInputOptions}
          />
        </div>
      )}
    </Box>
  );
}

export default LibraryContent;
