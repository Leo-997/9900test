import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useGetVariantQuickFilters from '@/hooks/QuickFilters/useGetVariantQuickFilters';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { getInframeFusionQFilter } from '@/utils/functions/quick filters/getInframeFusionQuickFilter';
import { getRNAConfidenceQuickFilter } from '@/utils/functions/quick filters/getRNAConfidenceQuickFilter';
import { sortSVsQuickFilters } from '@/utils/functions/quick filters/sortSVsQuickFilters';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISomaticSV, IUpdateSVBody, SVSummary } from '../../types/SV.types';
import { ISVSearchOptions } from '../../types/Search.types';
import { ISelectOption } from '../../types/misc.types';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import SVSearchFilterBar from '../SVSearchFilter/SVSearchFilterBar';
import SVsModalLeft from '../SVs/SVsModalLeft';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';
import SVListItem from '../SomaticSV/SVListItem';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: ISVSearchOptions = {
  genesearchquery: '',
  chromosome: [],
  genename: [],
  classpath: [],
  inframe: [],
  platform: [],
  rnaConfidence: [],
  fusionevent: [],
  sortColumns: [],
  sortDirections: [],
};

const defaultOptions: ISVSearchOptions = {
  ...emptyOptions,
};

export default function SVTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { somaticGeneList } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { tumourBiosample, analysisSet, rnaBiosample } = useAnalysisSet();

  const [loading, setLoading] = useState<boolean>(Boolean(tumourBiosample));
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<ISomaticSV>();
  const [geneIds, setGeneIds] = useState<ISelectOption<number>[]>([]);
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [svfilters, setSVFilters] = useState<ISVSearchOptions>(defaultOptions);
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(tumourBiosample),
  );
  const [svSummary, setSVsummary] = useState<SVSummary>({
    biosampleId: '',
    maxScore: 0,
    minScore: 0,
    avgScore: 0,
  });
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setSVFilters, false, true);

  const updateSvSummary = useCallback(async () => {
    if (tumourBiosample?.biosampleId) {
      const svSummaryData = await zeroDashSdk.sv.somatic.getSVSummary(
        tumourBiosample.biosampleId,
      );
      setSVsummary(svSummaryData);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk.sv]);

  const handleUpdateSV = async (
    body: IUpdateSVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.sv.somatic.updateSvById(
          newBody,
          notifItem.biosampleId,
          notifItem.internalId,
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, notifItem.reportable),
            defaultValue: reports,
            gene: notifItem.startGene.gene,
            secondaryGene: notifItem.endGene.gene,
            geneList: somaticGeneList,
          });
        }
        return newReports;
      } catch (err) {
        enqueueSnackbar('Cannot update SV data please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleSetDefaultSV = async (promotedSV: ISomaticSV): Promise<void> => {
    try {
      if (notifItem && tumourBiosample?.biosampleId) {
        await zeroDashSdk.sv.somatic.promoteSV(
          tumourBiosample.biosampleId,
          promotedSV.internalId,
          analysisSet.analysisSetId,
        );
        // set the fields for the new default
        const newDefaultSV: ISomaticSV = {
          ...promotedSV,
          reportable: notifItem.reportable,
          classification: notifItem.classification,
          targetable: notifItem.targetable,
          pathclass: notifItem.pathclass,
          researchCandidate: notifItem.researchCandidate,
        };
        // clear set fields for current default
        const oldDefault: ISomaticSV = {
          ...notifItem,
          classification: null,
          reportable: null,
          targetable: null,
          pathclass: null,
          researchCandidate: null,
        };
        // add the old default to the children
        const newSVChildren = [
          oldDefault,
          ...(notifItem.childSVs || []).filter(
            (childSV) => childSV.internalId !== promotedSV.internalId,
          ),
        ];
        setNotifItem({
          ...newDefaultSV,
          childSVs: newSVChildren,
        });
        // update selected reports data
        if (oldDefault.variantId !== newDefaultSV.variantId) {
          const oldDefaultReportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
            analysisSet.analysisSetId,
            {
              variantType: ['SV'],
              variantId: oldDefault.variantId.toString(),
            },
          );

          if (oldDefaultReportsData.length && tumourBiosample?.biosampleId) {
            const oldDefaultReports = oldDefaultReportsData.map(
              (reportsData) => reportsData.reportType,
            );
            // update reports with new variantId
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              tumourBiosample.biosampleId,
              {
                variantType: 'SV',
                variantId: newDefaultSV.variantId.toString(),
                reports: oldDefaultReports,
              },
            );
            // delete oldDefault reports data
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              tumourBiosample.biosampleId,
              {
                variantType: 'SV',
                variantId: oldDefault.variantId.toString(),
                reports: [],
              },
            );
          }
        }
      }
    } catch {
      enqueueSnackbar('Cannot update default SV data, please try again.', { variant: 'error' });
    }
  };

  const fetchSvData = useCallback(async (page: number, limit: number): Promise<ISomaticSV[]> => {
    if (!svfilters || !tumourBiosample?.biosampleId || defaultFiltersLoading) return [];

    const isDefault = (): boolean => JSON.stringify(svfilters) === JSON.stringify(defaultOptions);

    const mappedFilters = svfilters
      ? zeroDashSdk.sv.somatic.mapSvFilters(svfilters)
      : undefined;

    setLoading(true);
    const svData = await zeroDashSdk.sv.somatic.getSVs(
      tumourBiosample.biosampleId,
      {
        ...mappedFilters,
        defaultFilter: isDefault(),
      },
      page,
      limit,
    );
    updateSvSummary();
    setLoading(false);
    return svData;
  }, [
    tumourBiosample?.biosampleId,
    svfilters,
    zeroDashSdk.sv,
    updateSvSummary,
    defaultFiltersLoading,
  ]);

  const mapping = (sv: ISomaticSV, key: number, updateSV?: (sv: ISomaticSV) => void): ReactNode => (
    <SVListItem
      key={sv.internalId}
      sv={sv}
      minScore={svSummary.minScore}
      maxScore={svSummary.maxScore}
      updateSV={updateSV}
      allChildExpanded={allExpanded}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (tumourBiosample?.biosampleId) {
      await zeroDashSdk.sv.somatic.clearSvsPathclass(tumourBiosample.biosampleId);

      // forces fetchSvData to run again and refresh list
      setSVFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const internalId = getVariantId(search);
      if (internalId && tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.sv.somatic.getSVById(
          tumourBiosample.biosampleId,
          internalId,
        );
        const newGeneIds: ISelectOption<number>[] = [];
        if (data.startGene.geneId) {
          newGeneIds.push({
            name: data.startGene.gene,
            value: data.startGene.geneId,
          });
        }
        if (data.endGene.geneId) {
          newGeneIds.push({
            name: data.endGene.gene,
            value: data.endGene.geneId,
          });
        }
        setGeneIds(newGeneIds);
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [tumourBiosample?.biosampleId, zeroDashSdk.sv, search]);

  // Run once to get min and max score values
  useEffect(() => {
    async function updateSummary(): Promise<void> {
      if (tumourBiosample?.biosampleId) {
        const svSummaryData = await zeroDashSdk.sv.somatic.getSVSummary(
          tumourBiosample.biosampleId,
        );
        setSVsummary(svSummaryData);
      }
    }
    updateSummary();
  }, [tumourBiosample?.biosampleId, zeroDashSdk.sv]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (tumourBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = (): boolean => (
          JSON.stringify(svfilters) === JSON.stringify(defaultOptions)
        );
        const mappedFilters = svfilters
          ? zeroDashSdk.sv.somatic.mapSvFilters(svfilters)
          : undefined;
        const svCount = await zeroDashSdk.sv.somatic.getSVsCount(
          tumourBiosample.biosampleId,
          {
            ...mappedFilters,
            defaultFilter: isDefault(),
          },
        );
        setTotalCount(svCount);
      }
    }
    if (svfilters) {
      getCounts();
    }
  }, [
    svfilters,
    tumourBiosample?.biosampleId,
    zeroDashSdk.sv,
    defaultFiltersLoading,
  ]);

  useEffect(() => {
    const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);
    if (defaultFilter && tumourBiosample) {
      defaultOptions.genename = defaultFilter.geneList?.genes || [];
      setSVFilters(defaultOptions);
      setDefaultFiltersLoading(false);
    }
  }, [panelAndHRFilters, tumourBiosample]);

  return (
    <>
      <SVSearchFilterBar
        toggled={svfilters || emptyOptions}
        setToggled={setSVFilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        counts={{ current: count, total: totalCount }}
        quickFilters={[
          ...panelAndHRFilters,
          getInframeFusionQFilter(svfilters, setSVFilters),
          ...(
            rnaBiosample
              ? [getRNAConfidenceQuickFilter(svfilters, setSVFilters)]
              : []),
        ].toSorted(sortSVsQuickFilters)}
        loading={loading}
        setLoading={setLoading}
        allExpanded={allExpanded}
        setAllExpanded={setAllExpanded}
        setPathclassModalOpen={setPathclassModalOpen}
        disabled={!tumourBiosample}
      />
      <TabContentWrapper
        fetch={fetchSvData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />
      {expanded && notifItem && tumourBiosample && (
        <ExpandedModal
          open={expanded}
          variantType="SV"
          variantId={notifItem.variantId}
          biosampleId={tumourBiosample.biosampleId}
          variantGenes={
            notifItem.startGene.geneId === notifItem.endGene.geneId
              ? [notifItem.startGene]
              : [notifItem.startGene, notifItem.endGene]
            }
          handleClose={(): void => setExpanded(false)}
          title="GENE"
          titleContent={getCurationSVGenes(notifItem)}
          params={{
            cosmic: `/search?q=${notifItem.startGene.gene}`,
            clinvar: notifItem.startGene?.gene,
            gnomad: `/gene/${notifItem.startGene?.gene}`,
            pecan: `/proteinpaint/${notifItem.startGene?.gene}`,
            varSom: `/gene/${notifItem.startGene?.gene}`,
            geneCard: [notifItem.startGene?.gene, notifItem.endGene?.gene],
            genome: `?block=1&genome=hg19&position=chr${notifItem.chrBkpt2}:${
              notifItem.posBkpt2 - 1
            }-${notifItem.posBkpt2}`,
            ucscData: {
              chrBkpt1: notifItem.chrBkpt1,
              chrBkpt2: notifItem.chrBkpt2,
              posBkpt1: notifItem.posBkpt1,
              posBkpt2: notifItem.posBkpt2,
              biosampleId: notifItem.biosampleId,
            },
            oncokb: `/gene/${notifItem.startGene?.gene}`,
            geneIds,
          }}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={notifItem.pathclass}
            />
          )}
          variant={notifItem}
          handleUpdateVariant={handleUpdateSV}
          curationDataComponent={(
            <SVsModalLeft
              data={notifItem}
              handleUpdateSV={handleUpdateSV}
              handleSetDefaultSV={handleSetDefaultSV}
            />
          )}
        />
      )}
      {pathclassModalOpen && (
      <ClearPathclassModal
        isOpen={pathclassModalOpen}
        setIsOpen={setPathclassModalOpen}
        handleClearPathclass={handleClearPathclass}
        setLoading={setLoading}
      />
      )}
    </>
  );
}
