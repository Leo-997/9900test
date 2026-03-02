import { Box, Grid } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useClinical } from '@/contexts/ClinicalContext';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ISlideTableSettings } from '@/types/MTB/MTB.types';
import {
    defaultGeneAltColumnSettings,
    defaultNonGeneAltColumnSettings,
    defaultTumourImmuneProfileColumnSettings,
    defaultTumourMolecularProfileColumnSettings,
} from '../../../constants/MTB/molecularFindings';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IUpdateOrder } from '../../../types/Common.types';
import { itemTypes } from '../../../types/Draggable.types';
import {
    IMolecularAlterationDetail,
} from '../../../types/MTB/MolecularAlteration.types';
import { assignRelevantTypeAlterations } from '../../../utils/functions/assignRelevantAlterations';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomTypography from '../../Common/Typography';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import { TumourProfileTable } from './Components/Summary/TumourProfileTable';
import AlterationsTable from './Components/Summary/AlterationTable';

interface IProps {
  clinicalVersionId: string;
  frequencyUnits?: string;
  isPresentationMode?: boolean;
  canEditSampleData?: boolean;
  germlineConsent?: boolean;
}

type SlideTableSettingsGroup = keyof ISlideTableSettings;
type SlideTableGroupSettings<G extends SlideTableSettingsGroup> =
  NonNullable<ISlideTableSettings[G]>;

export function MolecularFindingsView({
  clinicalVersionId,
  frequencyUnits,
  isPresentationMode = false,
  canEditSampleData = false,
  germlineConsent = false,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    updateSlideTableVisibilitySettings,
  } = useClinical();
  const {
    analysisSet,
    immunoprofile,
    purity,
  } = useAnalysisSet();

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [molAlterations, setMolAlterations] = useState<IMolecularAlterationDetail[]>([]);
  const [geneTypeAlterations, setGeneTypeAlterations] = useState<IMolecularAlterationDetail[]>([]);
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
      if (clinicalVersionId) {
        const data = await zeroDashSdk.mtb.molAlteration.getMolAlterations(
          clinicalVersionId,
          {},
        );
        setMolAlterations(data);
      }
      setIsLoading(false);
    } catch (error) {
      enqueueSnackbar('Unable to load alterations, please try again', { variant: 'error' });
    }
  }, [clinicalVersionId, enqueueSnackbar, zeroDashSdk.mtb.molAlteration]);

  const updateOrder = useCallback(async (order: IUpdateOrder[]): Promise<void> => {
    try {
      await zeroDashSdk.mtb.molAlteration.updateMolAlterationSummaryOrder(clinicalVersionId, order);
      getMolAlterationSummary();
    } catch {
      enqueueSnackbar('Unable to update order, please try again', { variant: 'error' });
    }
  }, [clinicalVersionId, enqueueSnackbar, getMolAlterationSummary, zeroDashSdk.mtb.molAlteration]);

  const updateSetting = useCallback(
    <G extends SlideTableSettingsGroup>(
      group: G,
      key: keyof SlideTableGroupSettings<G>,
      checked: boolean,
    ) => updateSlideTableVisibilitySettings(
      group,
      { [key]: checked } as Partial<SlideTableGroupSettings<G>>,
    ),
    [updateSlideTableVisibilitySettings],
  );

  useEffect(() => {
    setIsLoading(true);
    getMolAlterationSummary()
      .finally(() => setIsLoading(false));
  }, [getMolAlterationSummary]);

  useEffect(() => {
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

    const getRelevantAlterations = (alterations: IMolecularAlterationDetail[]): void => {
      const {
        geneAndCytoAlterations,
        nonGeneAlterations,
      } = assignRelevantTypeAlterations(alterations);

      setGeneTypeAlterations(geneAndCytoAlterations.sort(sortAlterations));
      setNonGeneTypeAlterations(nonGeneAlterations.sort(sortAlterations));
    };

    getRelevantAlterations(molAlterations);
  }, [molAlterations]);

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
          onToggleColumn={(settingsKey, checked): Promise<void> => updateSetting(
            'tumourMolecularProfileSettings',
            settingsKey,
            checked,
          )}
          isPresentationMode={isPresentationMode}
          canEdit={canEditSampleData}
        />
        {immunoprofile && (
          <TumourProfileTable
            summary={tumourProfileSummary}
            defaultColumnSettings={defaultTumourImmuneProfileColumnSettings}
            visibilitySettings={tumourImmuneProfileSettings}
            onToggleColumn={(settingsKey, checked): Promise<void> => updateSetting(
              'tumourImmuneProfileSettings',
              settingsKey,
              checked,
            )}
            isPresentationMode={isPresentationMode}
            canEdit={canEditSampleData}
          />
        )}
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <>
            {(!isPresentationMode || nonGeneTypeAlterations.filter((a) => !a.hidden).length > 0)
              && (
                <Grid>
                  <ScrollableSection style={{ overflowY: 'hidden' }}>
                    <AlterationsTable
                      // This key is important to force the rows in the table to
                      // rerender after reordering This is to make sure that the
                      // dropzones will pass the correct information back to the onDrop function
                      key={nonGeneTypeAlterations.map((a) => a.id).join('-')}
                      itemType={itemTypes.GENE_ALTERATION}
                      frequencyUnits={frequencyUnits}
                      isPresentationMode={isPresentationMode}
                      canEdit={canEditSampleData}
                      defaultColumnSettings={defaultNonGeneAltColumnSettings}
                      visibilitySettings={nonGeneMolAlterationSettings}
                      onToggleColumn={(settingsKey, checked): Promise<void> => updateSetting(
                        'nonGeneMolAlterationSettings',
                        settingsKey,
                        checked,
                      )}
                      alterations={nonGeneTypeAlterations}
                      updateOrder={updateOrder}
                      getMolAlterationSummary={getMolAlterationSummary}
                      isForNonGeneType
                    />
                  </ScrollableSection>
                </Grid>
              )}
            {(!isPresentationMode || geneTypeAlterations.filter((a) => !a.hidden).length > 0)
              && (
                <Grid>
                  <ScrollableSection style={{ overflowY: 'hidden' }}>
                    <AlterationsTable
                      // This key is important to force the rows in the table to
                      // rerender after reordering This is to make sure that the
                      // dropzones will pass the correct information back to the onDrop function
                      key={geneTypeAlterations.map((a) => a.id).join('-')}
                      itemType={itemTypes.GENE_ALTERATION}
                      frequencyUnits={frequencyUnits}
                      isPresentationMode={isPresentationMode}
                      canEdit={canEditSampleData}
                      defaultColumnSettings={defaultGeneAltColumnSettings}
                      visibilitySettings={molAlterationSettings}
                      onToggleColumn={(settingsKey, checked): Promise<void> => updateSetting(
                        'molAlterationSettings',
                        settingsKey,
                        checked,
                      )}
                      alterations={geneTypeAlterations}
                      updateOrder={updateOrder}
                      getMolAlterationSummary={getMolAlterationSummary}
                    />
                  </ScrollableSection>
                </Grid>
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
