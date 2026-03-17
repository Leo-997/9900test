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
import {
  IGermlineSV,
  IUpdateSVBody,
  SVGermlineSummary,
} from '../../types/SV.types';
import { ISVGermlineSearchOptions } from '../../types/Search.types';
import { ISelectOption } from '../../types/misc.types';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import SVGermlineListItem from '../SVGermline/SVGermlineListItem';
import SVSearchFilterBar from '../SVSearchFilter/SVSearchFilterBar';
import SVsModal from '../SVs/SVsModalLeft';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: ISVGermlineSearchOptions = {
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

const defaultOptions: ISVGermlineSearchOptions = {
  ...emptyOptions,
};

export default function SVGermlineTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const {
    germlineBiosample, analysisSet, demographics, rnaBiosample,
  } = useAnalysisSet();
  const { germlineGeneList } = useCuration();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(Boolean(germlineBiosample));
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IGermlineSV>();
  const [geneIds, setGeneIds] = useState<ISelectOption<number>[]>([]);
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [
    svGermlineFilters,
    setSVGermlineFilters,
  ] = useState<ISVGermlineSearchOptions>(defaultOptions);
  const [svGermlineSummary, setSVGermlinesummary] = useState<SVGermlineSummary>({
    matchedNormalId: '',
    maxScore: 0,
    minScore: 0,
    avgScore: 0,
  });
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(germlineBiosample),
  );
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setSVGermlineFilters, true, true);

  const updateSVGermlineSummary = useCallback(async () => {
    if (germlineBiosample?.biosampleId) {
      const svGermlineSummaryData = await zeroDashSdk.sv.germline.getGermlineSVSummary(
        germlineBiosample.biosampleId,
      );
      setSVGermlinesummary(svGermlineSummaryData);
    }
  }, [germlineBiosample?.biosampleId, zeroDashSdk.sv.germline]);

  const handleUpdateGermlineSV = async (
    body: IUpdateSVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (notifItem) {
      try {
        const newReportable = getUpdatedReportableValue(body, notifItem.reportable);
        const newBody = {
          ...body,
          reportable: newReportable,
        };
        await zeroDashSdk.sv.germline.updateGermlineSVById(
          newBody,
          notifItem.biosampleId,
          notifItem.internalId,
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: newReportable,
            defaultValue: reports,
            gene: notifItem.startGene.gene,
            secondaryGene: notifItem.endGene.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_SV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch (err) {
        enqueueSnackbar('Cannot update Germline SV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleSetDefaultSV = async (promotedSV: IGermlineSV): Promise<void> => {
    try {
      if (notifItem) {
        await zeroDashSdk.sv.germline.promoteGermlineSV(
          notifItem.biosampleId,
          promotedSV.internalId,
          analysisSet.analysisSetId,
        );
        // set the fields for the new default
        const newDefaultSV: IGermlineSV = {
          ...promotedSV,
          classification: notifItem.classification,
          reportable: notifItem.reportable,
          targetable: notifItem.targetable,
          pathclass: notifItem.pathclass,
          researchCandidate: notifItem.researchCandidate,
        };
        // clear set fields for current default
        const oldDefault: IGermlineSV = {
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
          // old default's reports data
          const oldDefltReportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
            analysisSet.analysisSetId,
            {
              variantType: ['GERMLINE_SV'],
              variantId: oldDefault.variantId.toString(),
            },
          );

          if (oldDefltReportsData.length && germlineBiosample?.biosampleId) {
            const oldDefaultReports = oldDefltReportsData.map(
              (reportsData) => reportsData.reportType,
            );
            // update reports with new variantId
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              germlineBiosample.biosampleId,
              {
                variantType: 'GERMLINE_SV',
                variantId: newDefaultSV.variantId.toString(),
                reports: oldDefaultReports,
              },
            );
            // delete oldDefault reports data
            await zeroDashSdk.reportableVariants.updateReportableVariant(
              analysisSet.analysisSetId,
              germlineBiosample.biosampleId,
              {
                variantType: 'GERMLINE_SV',
                variantId: oldDefault.variantId.toString(),
                reports: [],
              },
            );
          }
        }
      }
    } catch {
      enqueueSnackbar('Cannot update default Germline SV data, please try again.', { variant: 'error' });
    }
  };

  const fetchGermlineSVData = useCallback(async (
    page: number,
    limit: number,
  ): Promise<IGermlineSV[]> => {
    if (!svGermlineFilters || !germlineBiosample?.biosampleId || defaultFiltersLoading) return [];

    const isDefault = JSON.stringify(svGermlineFilters) === JSON.stringify(defaultOptions);

    const mappedFilters = svGermlineFilters
      ? zeroDashSdk.sv.germline.mapSVGermlineFilters(svGermlineFilters)
      : undefined;

    setLoading(true);
    const germSvData = await zeroDashSdk.sv.germline.getGermlineSVs(
      germlineBiosample.biosampleId,
      {
        ...mappedFilters,
        defaultFilter: isDefault,
      },
      page,
      limit,
    );
    updateSVGermlineSummary();
    setLoading(false);
    return germSvData;
  }, [
    germlineBiosample?.biosampleId,
    defaultFiltersLoading,
    svGermlineFilters,
    updateSVGermlineSummary,
    zeroDashSdk.sv.germline,
  ]);

  const mapping = (
    sv: IGermlineSV,
    key: number,
    updateGermlineSV?: (sv: IGermlineSV) => void,
  ): ReactNode => (
    <SVGermlineListItem
      key={sv.internalId}
      germlineSV={sv}
      minScore={svGermlineSummary.minScore}
      maxScore={svGermlineSummary.maxScore}
      updateGermlineSV={updateGermlineSV}
      allChildExpanded={allExpanded}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (germlineBiosample?.biosampleId) {
      await zeroDashSdk.sv.germline.clearSvsPathclass(germlineBiosample.biosampleId);

      // forces fetchGermlineSVData to run again and refresh list
      setSVGermlineFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const internalId = getVariantId(search);
      if (internalId && germlineBiosample?.biosampleId) {
        const data = await zeroDashSdk.sv.germline.getSampleGermlineSVById(
          germlineBiosample.biosampleId,
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
  }, [germlineBiosample?.biosampleId, search, zeroDashSdk.sv.germline]);

  // Run once to get min and max score values
  useEffect(() => {
    async function updateSummary(): Promise<void> {
      if (germlineBiosample?.biosampleId) {
        const svSummaryData = await zeroDashSdk.sv.germline.getGermlineSVSummary(
          germlineBiosample.biosampleId,
        );
        setSVGermlinesummary(svSummaryData);
      }
    }
    updateSummary();
  }, [germlineBiosample?.biosampleId, zeroDashSdk.sv.germline]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (germlineBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = JSON.stringify(svGermlineFilters) === JSON.stringify(defaultOptions);
        const mappedFilters = svGermlineFilters
          ? zeroDashSdk.sv.germline.mapSVGermlineFilters(svGermlineFilters)
          : undefined;
        const svCount = await zeroDashSdk.sv.germline.getSampleGermlineSVsCount(
          germlineBiosample.biosampleId,
          {
            ...mappedFilters,
            defaultFilter: isDefault,
          },
        );
        setTotalCount(svCount);
      }
    }
    if (svGermlineFilters) {
      getCounts();
    }
  }, [
    defaultFiltersLoading,
    germlineBiosample?.biosampleId,
    svGermlineFilters,
    zeroDashSdk.sv.germline,
  ]);

  useEffect(() => {
    const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);
    if (defaultFilter && germlineBiosample) {
      defaultOptions.genename = defaultFilter.geneList?.genes || [];
      setSVGermlineFilters(defaultOptions);
      setDefaultFiltersLoading(false);
    }
  }, [germlineBiosample, panelAndHRFilters]);

  return (
    <>
      <SVSearchFilterBar
        toggled={svGermlineFilters || emptyOptions}
        setToggled={setSVGermlineFilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        counts={{ current: count, total: totalCount }}
        quickFilters={[
          ...panelAndHRFilters,
          getInframeFusionQFilter(svGermlineFilters, setSVGermlineFilters),
          ...(
            rnaBiosample
              ? [getRNAConfidenceQuickFilter(svGermlineFilters, setSVGermlineFilters)]
              : []),
        ].toSorted(sortSVsQuickFilters)}
        loading={loading}
        setLoading={setLoading}
        allExpanded={allExpanded}
        setAllExpanded={setAllExpanded}
        isGermline
        setPathclassModalOpen={setPathclassModalOpen}
        disabled={!germlineBiosample}
      />
      <TabContentWrapper
        fetch={fetchGermlineSVData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />
      {expanded && notifItem && germlineBiosample && (
        <ExpandedModal
          open={expanded}
          variantType="GERMLINE_SV"
          variantId={notifItem.variantId}
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={notifItem.startGene.geneId === notifItem.endGene.geneId
            ? [notifItem.startGene]
            : [notifItem.startGene, notifItem.endGene]}
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
            ucscData: notifItem,
            oncokb: `/gene/${notifItem.startGene?.gene}`,
            geneIds,
          }}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={notifItem.pathclass}
            />
          )}
          variant={notifItem}
          handleUpdateVariant={handleUpdateGermlineSV}
          curationDataComponent={(
            <SVsModal
              data={notifItem}
              handleUpdateSV={handleUpdateGermlineSV}
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
