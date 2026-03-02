import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useGetVariantQuickFilters from '@/hooks/QuickFilters/useGetVariantQuickFilters';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGermlineCNV, IUpdateCNVBody } from '../../types/CNV.types';
import { ISummary } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { ICNVGermlineSearchOptions } from '../../types/Search.types';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import CNVGermlineListItem from '../CNVGermline/CNVGermlineListItem';
import CNVGermLineModalLeft from '../CNVGermline/CNVGermLineModalLeft';
import CNVGermlineSearchFilterBar from '../CNVGermline/CNVGermlineSearchFilterBar';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: ICNVGermlineSearchOptions = {
  cnType: [],
  genesearchquery: '',
  chromosome: [],
  genename: [],
  classpath: [],
  sortColumns: [],
  sortDirections: [],
};

const defaultOptions: ICNVGermlineSearchOptions = {
  ...emptyOptions,
};

export default function CNVGermlineTabContent(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { search } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineGeneList } = useCuration();
  const { germlineBiosample, demographics } = useAnalysisSet();

  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(Boolean(germlineBiosample));
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IGermlineCNV>();
  const [cnvSummary, setCnvSummary] = useState<ISummary>({
    min: 0,
    max: 0,
    mid: 0,
  });
  const [
    cnvGermlineFilters,
    setCNVGermlineFilters,
  ] = useState<ICNVGermlineSearchOptions>(defaultOptions);
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(germlineBiosample),
  );
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setCNVGermlineFilters, true);

  const handleUpdateCNV = async (
    body: IUpdateCNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.cnv.germline.updateRecordByVariantId(
          newBody,
          germlineBiosample.biosampleId,
          notifItem.variantId,
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, notifItem.reportable),
            defaultValue: reports,
            gene: notifItem.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_CNV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update CNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const updateCnvGermlineSummary = useCallback(async () => {
    if (germlineBiosample?.biosampleId) {
      const summary = await zeroDashSdk.cnv.germline.getCuratedSampleGermlineCnvSummary(
        germlineBiosample.biosampleId,
      );
      setCnvSummary(summary);
    }
  }, [germlineBiosample?.biosampleId, zeroDashSdk.cnv.germline]);

  const getGermlineCnvData = useCallback(async (page: number, limit: number) => {
    if (germlineBiosample?.biosampleId && !defaultFiltersLoading) {
      setLoading(true);
      const mappedFilters = cnvGermlineFilters
        ? zeroDashSdk.cnv.germline.mapCnvGermlineFilters(cnvGermlineFilters)
        : undefined;
      const germCnvData = await zeroDashSdk.cnv.germline.getAllGermlineCnv(
        germlineBiosample.biosampleId,
        mappedFilters || {},
        page,
        limit,
      );
      updateCnvGermlineSummary();
      setLoading(false);
      return germCnvData;
    }
    return [];
  }, [
    cnvGermlineFilters,
    defaultFiltersLoading,
    germlineBiosample?.biosampleId,
    updateCnvGermlineSummary,
    zeroDashSdk.cnv.germline,
  ]);

  const mapping = (
    item: IGermlineCNV,
    key: number,
    updateCNV?: (cnv: IGermlineCNV) => void,
  ): ReactNode => (
    <CNVGermlineListItem
      key={key}
      cnv={item}
      updateCNV={updateCNV}
      summary={cnvSummary}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (germlineBiosample?.biosampleId) {
      await zeroDashSdk.cnv.germline.clearCnvsPathclass(
        germlineBiosample.biosampleId,
      );

      // forces getGermlineCnvData to run again and refresh list
      setCNVGermlineFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (germlineBiosample?.biosampleId && !defaultFiltersLoading) {
        const mappedFilters = cnvGermlineFilters
          ? zeroDashSdk.cnv.germline.mapCnvGermlineFilters(cnvGermlineFilters)
          : undefined;
        const germCnvCount = await zeroDashSdk.cnv.germline.getAllGermlineCnvCount(
          germlineBiosample.biosampleId,
          mappedFilters || {},
        );
        setTotalCount(germCnvCount);
      }
    }
    getCounts();
  }, [
    germlineBiosample?.biosampleId,
    cnvGermlineFilters,
    zeroDashSdk.cnv.germline,
    defaultFiltersLoading,
  ]);

  useEffect(() => {
    const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);

    if (defaultFilter && germlineBiosample) {
      defaultOptions.genename = defaultFilter.geneList?.genes || [];
      setCNVGermlineFilters(defaultOptions);
      setDefaultFiltersLoading(false);
    }
  }, [germlineBiosample, panelAndHRFilters]);

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && germlineBiosample?.biosampleId) {
        const data = await zeroDashSdk.cnv.germline.getGermlineCnvByVariantId(
          germlineBiosample.biosampleId,
          variantId,
        );
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [germlineBiosample?.biosampleId, search, zeroDashSdk]);

  return (
    <div>
      <CNVGermlineSearchFilterBar
        toggled={cnvGermlineFilters || emptyOptions}
        setToggled={setCNVGermlineFilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        counts={{ current: count, total: totalCount }}
        quickFilters={panelAndHRFilters}
        loading={loading}
        setLoading={setLoading}
        setPathclassModalOpen={setPathclassModalOpen}
        disabled={!germlineBiosample}
      />
      <TabContentWrapper
        fetch={getGermlineCnvData}
        updateCount={setCount}
        mapping={mapping}
      />
      {expanded && germlineBiosample && notifItem && (
        <ExpandedModal
          params={{
            cosmic: `/gene/analysis?ln=${notifItem.gene}`,
            clinvar: notifItem.gene,
            gnomad: `/gene/${notifItem.gene}`,
            oncokb: `/gene/${notifItem.gene}`,
            pecan: `/proteinpaint/${notifItem.gene}`,
            varSom: `/gene/${notifItem.gene}`,
            civic: { gene: notifItem.gene, variant: 'EXPRESSION' },
            geneCard: notifItem.gene,
            geneIds: [
              {
                name: notifItem.gene,
                value: notifItem.geneId,
              },
            ],
          }} // should provide a valid gene
          open={expanded}
          handleClose={(): void => setExpanded(false)}
          title="GENE"
          titleContent={notifItem.gene}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={notifItem.pathclass}
            />
          )}
          variant={notifItem}
          handleUpdateVariant={handleUpdateCNV}
          curationDataComponent={(
            <CNVGermLineModalLeft
              data={notifItem}
              handleUpdateData={handleUpdateCNV}
              summary={cnvSummary}
            />
          )}
          variantType="GERMLINE_CNV"
          variantId={notifItem.variantId}
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={[{
            geneId: notifItem.geneId,
            gene: notifItem.gene,
          }]}
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
    </div>
  );
}
