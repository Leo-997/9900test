import { highRiskCohorts } from '@/constants/sample';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IGeneQuickFilter } from '@/types/Common.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { SearchOptions } from '@/types/Search.types';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

/*
 *  NOTE
 *
 *  This hook is intended for creating the "Panel", "High Risk", and "No Gene List" quick filters,
 *  used in both somatic and germline variants.
*/

interface IUseGetVariantQuickFilters<T> {
  panelAndHRFilters: IGeneQuickFilter<T>[]
}

const useGetVariantQuickFilters = <T extends SearchOptions>(
  setToggled: Dispatch<SetStateAction<T>>,
  isGermline = false,
  withNoGeneList = false,
): IUseGetVariantQuickFilters<T> => {
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();

  const [panelAndHRFilters, setPanelAndHRFilters] = useState<IGeneQuickFilter<T>[]>([]);

  const isPanel = useMemo(() => analysisSet.biosamples?.some(
    (biosample) => biosample.sampleType === 'panel',
  ), [analysisSet.biosamples]);

  useEffect(() => {
    async function setQuickFilters(): Promise<void> {
      try {
        const [panelGeneList]: (IGeneList | undefined)[] = await zeroDashSdk
          .services
          .reports
          .getGeneLists({
            isActive: true,
            genePanel: analysisSet?.genePanel ?? 'No panel',
            type: isGermline ? 'germline' : 'somatic',
            isHighRisk: false,
          });

        const [highRiskGeneList]: (IGeneList | undefined)[] = await zeroDashSdk
          .services
          .reports
          .getGeneLists({
            isActive: true,
            genePanel: 'No panel',
            type: isGermline ? 'germline' : 'somatic',
            isHighRisk: true,
          });

        if (!panelAndHRFilters.length && isPanel !== undefined) {
          const cohorts = highRiskCohorts;
          setPanelAndHRFilters([
            // Only add Panel if it's a different list from HR.
            ...(
              panelGeneList?.genes
              && panelGeneList?.versionId !== highRiskGeneList?.versionId
                ? [{
                  label: 'Panel',
                  geneList: panelGeneList,
                  onClick: () => setToggled((prev) => ({ ...prev, genename: panelGeneList.genes })),
                  checkIsActive: (toggled: T) => (
                    'genename' in toggled && JSON.stringify(toggled.genename) === JSON.stringify(panelGeneList.genes)
                  ),
                  isDefault:
                    cohorts.every((cohort) => cohort !== analysisSet.cohort)
                    && !isGermline
                    && !isPanel,
                  tooltip: `${panelGeneList.name} version ${panelGeneList.version}`,
                }] : []),
            ...([{
              label: 'High risk',
              geneList: highRiskGeneList,
              onClick: () => setToggled((prev) => ({
                ...prev,
                genename: highRiskGeneList.genes,
              })),
              checkIsActive: (toggled: T) => (
                'genename' in toggled
                && JSON.stringify(toggled.genename) === JSON.stringify(highRiskGeneList.genes)
              ),
              isDefault:
                cohorts.some((cohort) => cohort === analysisSet.cohort)
                || isGermline
                || isPanel
                || !panelGeneList
                || panelGeneList.versionId === highRiskGeneList.versionId,
              tooltip: `${highRiskGeneList.name} version ${highRiskGeneList.version}`,
            }]),
            ...(withNoGeneList
              ? [{
                label: 'No gene list',
                onClick: () => setToggled((prev) => ({
                  ...prev,
                  genename: [],
                })),
                checkIsActive: (toggled: T) => 'genename' in toggled && !toggled.genename.length,
                isDefault: false,
              }]
              : []),
          ]);
        }
      } catch {
        setPanelAndHRFilters([]);
      }
    }

    setQuickFilters();
  }, [
    analysisSet,
    isGermline,
    isPanel,
    panelAndHRFilters.length,
    setToggled,
    withNoGeneList,
    zeroDashSdk.gene,
    zeroDashSdk.services.reports,
  ]);

  return {
    panelAndHRFilters,
  };
};

export default useGetVariantQuickFilters;
