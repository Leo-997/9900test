import { useClinical } from '@/contexts/ClinicalContext';
import { corePalette } from '@/themes/colours';
import {
  Accordion as AccordionBase,
  AccordionDetails as AccordionDetailsBase,
  AccordionSummary as AccordionSummaryBase,
  Box,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronDown } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import useEvidences from '../../../../../../../api/useEvidences';
import { useTherapyRecommendation } from '../../../../../../../contexts/TherapyRecommendationContext';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import { Evidence, IEvidenceLinkQuery } from '../../../../../../../types/Evidence/Evidences.types';
import CustomTypography from '../../../../../../Common/Typography';
import EvidenceArchive from '../../../../../../Evidence/Archive/EvidenceArchive';
import EvidenceListItem from '../../../../../../Evidence/EvidenceList/ListItems/EvidenceListItem';

const useStyles = makeStyles(() => ({
  stickySearch: {
    position: 'sticky',
    top: '26px',
    zIndex: 2,
    backgroundColor: '#FFFFFF',
  },
}));

const Accordion = styled(AccordionBase)({
  paddingBottom: '8px',
});

const AccordionSummary = styled(AccordionSummaryBase)({
  minHeight: '36px',
  position: 'sticky',
  top: '158px',
  paddingRight: 0,
  flexDirection: 'row-reverse',
  backgroundColor: corePalette.grey30,
  zIndex: 1,
});

const AccordionDetails = styled(AccordionDetailsBase)({
  padding: 0,
  paddingTop: '8px',
});

interface IProps {
  activeDrugPanel: ReactNode;
}

export default function EvidencesPanel({
  activeDrugPanel,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const {
    getAllEvidence,
    getClinicalEvidence,
  } = useEvidences();
  const {
    selectedTherapyDrugs,
    chemotherapy,
    radiotherapy,
    selectedEvidence,
    setSelectedEvidence,
    existingRec,
  } = useTherapyRecommendation();

  const [drugEvidence, setDrugEvidence] = useState<Evidence[]>();
  const [caseEvidence, setCaseEvidence] = useState<Evidence[]>([]);
  // Need to keep this to add them to the selected evidence section
  const [selectedEvidenceDetails, setSelectedEvidenceDetails] = useState<Evidence[]>([]);

  // Filters that apply to the evidence MS

  const handlePickEvidence = (evidence: Evidence): void => {
    setSelectedEvidenceDetails((prev) => {
      let newEvidences = [...prev];
      if (prev.some((e) => e.id === evidence.id)) {
        newEvidences = prev.filter((e) => e.id !== evidence.id);
      } else {
        newEvidences = [...prev, evidence];
      }

      return newEvidences;
    });

    setSelectedEvidence((prev) => {
      let newEvidences = [...prev];
      if (prev.some((e) => e === evidence.evidenceId)) {
        newEvidences = prev.filter((e) => e !== evidence.evidenceId);
      } else {
        newEvidences = [...prev, evidence.evidenceId];
      }

      return newEvidences;
    });
  };

  const getEvidenceLinks = useCallback(async (
    filters?: IEvidenceLinkQuery,
  ): Promise<Evidence[]> => (
    getClinicalEvidence({ evidenceLinkFilters: filters })
      .then((resp) => resp.allEvidence)
  ), [getClinicalEvidence]);

  useEffect(() => {
    // if we don't already have the details for any evidence id, fetch them
    if (
      selectedEvidence.some(
        (evidenceId) => selectedEvidenceDetails.every(
          (evidence) => evidence.evidenceId !== evidenceId,
        ),
      )
    ) {
      getAllEvidence({
        evidenceDetailsFilters: {
          ids: selectedEvidence,
        },
      })
        .then((resp) => {
          setSelectedEvidenceDetails(resp.allEvidence);
        });
    }
  }, [getAllEvidence, selectedEvidence, selectedEvidenceDetails]);

  useEffect(() => {
    setDrugEvidence(undefined);
    if (
      selectedTherapyDrugs.filter(
        (d) => d.class !== null,
      ).length
    ) {
      zeroDashSdk.mtb.therapies.getMatchingTherapies({
        combination: selectedTherapyDrugs.map(
          (d) => `${d.class?.id as string}${d.drug?.versionId ? `|${d.drug.versionId}` : ''}`,
        ),
        chemotherapy: chemotherapy.includeOption,
        radiotherapy: radiotherapy.includeOption,
      })
        .then(async (resp) => {
          if (resp.length > 0) {
            const allEvidence = await getEvidenceLinks({
              entityTypes: ['THERAPY'],
              entityIds: existingRec?.therapyId ? [existingRec.therapyId] : [],
            });
            setDrugEvidence(allEvidence);
          } else {
            setDrugEvidence([]);
          }
        });
    }
  }, [
    getEvidenceLinks,
    existingRec?.therapyId,
    clinicalVersion.id,
    chemotherapy.includeOption,
    radiotherapy.includeOption,
    selectedTherapyDrugs,
    getAllEvidence,
    zeroDashSdk.mtb.evidence,
    zeroDashSdk.mtb.therapies,
  ]);

  useEffect(() => {
    getEvidenceLinks({
      entityTypes: ['SLIDE'],
      clinicalVersionId: clinicalVersion.id,
    }).then((result) => {
      setCaseEvidence(result);
    });
  }, [clinicalVersion.id, getEvidenceLinks]);

  const handleAlreadyPicked = (item: Evidence): boolean => (
    selectedEvidence.some((e) => e === item.evidenceId)
  );

  const mapping = (item: Evidence): ReactNode => (
    <EvidenceListItem
      key={item.id}
      evidence={item}
      onSelect={handlePickEvidence}
      isSelected={handleAlreadyPicked(item)}
      allowDeselecting
      canSelect
    />
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      sx={{
        width: '100%',
        height: 'calc(100vh - 220px)',
      }}
    >
      <EvidenceArchive
        classNames={{
          searchFilter: classes.stickySearch,
        }}
        contentBeforeSearch={(
          <>
            {activeDrugPanel}
            <Box
              display="flex"
              flexDirection="column"
              paddingTop="16px"
              sx={{
                backgroundColor: corePalette.white,
                position: 'sticky',
                top: '-16px',
                zIndex: 2,
              }}
            >
              <CustomTypography variant="h5" fontWeight="medium">
                Evidence
              </CustomTypography>
            </Box>
          </>
        )}
        contentAfterSearch={(
          <>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <CustomTypography variant="label">
                  Evidence selected (
                  {selectedEvidenceDetails.length}
                  )
                </CustomTypography>
              </AccordionSummary>
              <AccordionDetails>
                {(selectedEvidenceDetails.length === 0) && (
                  <CustomTypography>
                    <i>No evidence selected</i>
                  </CustomTypography>
                )}
                {selectedEvidenceDetails?.map(mapping)}
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <CustomTypography
                  variant="label"
                >
                  Evidence previously added to this drug or drug combination
                </CustomTypography>
              </AccordionSummary>
              <AccordionDetails>
                {(!drugEvidence || drugEvidence?.length === 0) && (
                  <CustomTypography>
                    <i>No evidence previously added to this drug or drug combination</i>
                  </CustomTypography>
                )}
                {drugEvidence?.map(mapping)}
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <CustomTypography
                  variant="label"
                >
                  Evidence linked to this case
                </CustomTypography>
              </AccordionSummary>
              <AccordionDetails>
                {(caseEvidence.length === 0) && (
                  <CustomTypography>
                    <i>No evidence added to this case</i>
                  </CustomTypography>
                )}
                {caseEvidence.map(mapping)}
              </AccordionDetails>
            </Accordion>
            <AccordionSummary>
              <CustomTypography
                variant="label"
              >
                All other evidence
              </CustomTypography>
            </AccordionSummary>
          </>
        )}
        handlePickEvidence={handlePickEvidence}
        selectedEvidenceIds={selectedEvidence}
        canSelectEvidence
        allowDeselecting
        getEvidenceLinks={getEvidenceLinks}
      />
    </Box>
  );
}
