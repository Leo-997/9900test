import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useClinical } from '@/contexts/ClinicalContext';
import { Box, Grid } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import {
    defaultGeneAltColumnSettings, defaultNonGeneAltColumnSettings,
    defaultTumourImmuneProfileColumnSettings,
    defaultTumourMolecularProfileColumnSettings,
} from '../../../constants/MTB/molecularFindings';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../types/MTB/MolecularAlteration.types';
import { assignRelevantTypeAlterations } from '../../../utils/functions/assignRelevantAlterations';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomTypography from '../../Common/Typography';
import AlterationsTableExport from './Components/Summary/AlterationTableExport';
import { TumourProfileTable } from './Components/Summary/TumourProfileTable';

interface IProps {
  germlineConsent: boolean;
}

export function MolecularFindingsViewExport({
  germlineConsent,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
    immunoprofile,
    purity,
  } = useAnalysisSet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [
    geneTypeAlterations,
    setGeneTypeAlterations,
  ] = useState<IMolecularAlterationDetail[]>([]);
  const [
    nonGeneTypeAlterations,
    setNonGeneTypeAlterations,
  ] = useState<IMolecularAlterationDetail[]>([]);

  const {
    nonGeneMolAlterationSettings,
    molAlterationSettings,
    tumourMolecularProfileSettings,
    tumourImmuneProfileSettings,
  } = clinicalVersion.slideTableSettings;

  const tumourProfileSummary = {
    ipass: immunoprofile ?? undefined,
    m1m2: immunoprofile ?? undefined,
    cd8: immunoprofile ?? undefined,
    tumourMutationBurden: {
      somMissenseSnvs: analysisSet.somMissenseSnvs,
      mutBurdenMb: analysisSet.mutBurdenMb,
    },
    ...purity,
    ...analysisSet,
  };

  const getMolAlterationSummary = useCallback(async () => {
    try {
      const molAlts = await zeroDashSdk.mtb.molAlteration.getMolAlterations(clinicalVersion.id, {});

      const sortAlterations = (
        a: IMolecularAlterationDetail,
        b: IMolecularAlterationDetail,
      ): number => {
        const aOrder = a.summaryOrder || 0;
        const bOrder = b.summaryOrder || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // Push targetable alterations to the top
        if (a.clinicalTargetable === b.clinicalTargetable) return 0;
        if (a.clinicalTargetable) return -1;
        return 1;
      };

      const { geneAndCytoAlterations, nonGeneAlterations } = assignRelevantTypeAlterations(molAlts);
      setGeneTypeAlterations(geneAndCytoAlterations.sort(sortAlterations));
      setNonGeneTypeAlterations(nonGeneAlterations.sort(sortAlterations));
    } catch (error) {
      enqueueSnackbar('Unable to load alterations, please try again', { variant: 'error' });
    }
  }, [clinicalVersion.id, enqueueSnackbar, zeroDashSdk.mtb.molAlteration]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      await getMolAlterationSummary();
      setIsLoading(false);
    };
    fetchData();
  }, [getMolAlterationSummary]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="12px"
      padding="1.2% 32px"
    >
      <Grid
        container
        direction="column"
        wrap="nowrap"
        height="100%"
        gap="32px"
      >
        <TumourProfileTable
          summary={tumourProfileSummary}
          defaultColumnSettings={defaultTumourMolecularProfileColumnSettings}
          visibilitySettings={tumourMolecularProfileSettings}
          isPresentationMode
          isExport
        />
        {immunoprofile && (
          <TumourProfileTable
            summary={tumourProfileSummary}
            defaultColumnSettings={defaultTumourImmuneProfileColumnSettings}
            visibilitySettings={tumourImmuneProfileSettings}
            isPresentationMode
            isExport
          />
        )}
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <>
            {nonGeneTypeAlterations.filter((a) => !a.hidden).length > 0 && (
              <AlterationsTableExport
                defaultColumnSettings={defaultNonGeneAltColumnSettings}
                visibilitySettings={nonGeneMolAlterationSettings}
                alterations={nonGeneTypeAlterations}
                isForNonGeneType
              />
            )}
            {geneTypeAlterations.filter((a) => !a.hidden).length > 0 && (
              <AlterationsTableExport
                defaultColumnSettings={defaultGeneAltColumnSettings}
                visibilitySettings={molAlterationSettings}
                alterations={geneTypeAlterations}
              />
            )}
          </>
        )}
      </Grid>
      {germlineConsent
        && geneTypeAlterations.every((g) => !g.mutationType.includes('GERMLINE'))
        && (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            gap="8px"
          >
            <InfoIcon />
            <CustomTypography variant="bodyRegular">
              There are no reportable germline findings
            </CustomTypography>
          </Box>
        )}
    </Box>
  );
}
