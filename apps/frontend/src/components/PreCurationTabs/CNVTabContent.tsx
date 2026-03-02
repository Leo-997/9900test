import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';

import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useGetVariantQuickFilters from '@/hooks/QuickFilters/useGetVariantQuickFilters';
import CNVSearchFilterBar from '../CNVSearchFilter/CNVSearchFilterBar';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';

import { chromosomes } from '../../constants/options';
import type { IGeneQuickFilter } from '../../types/Common.types';
import { ICNVSummary, ISomaticCNV, IUpdateCNVBody } from '../../types/CNV.types';
import { ICNVSearchOptions } from '../../types/Search.types';
import CNVListItem from '../CNV/CNVListItem';

import { useCuration } from '../../contexts/CurationContext';
import { ReportType } from '../../types/Reports/Reports.types';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import CNVModalLeft from '../CNV/CNVModalLeft';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: ICNVSearchOptions = {
  cnType: [],
  genesearchquery: '',
  chromosome: [],
  genename: [],
  classpath: [],
  sortColumns: [],
  sortDirections: [],
};

const defaultOptions: ICNVSearchOptions = {
  ...emptyOptions,
};

export default function CNVTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { somaticGeneList } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const {
    tumourBiosample,
  } = useAnalysisSet();

  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(Boolean(tumourBiosample));
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<ISomaticCNV>();
  const [cnvfilters, setCNVFilters] = useState<ICNVSearchOptions>(defaultOptions);
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(tumourBiosample),
  );
  const [cnvSummary, setCnvSummary] = useState<ICNVSummary>({
    copyNumber: {
      min: 0,
      max: 0,
      mid: 0,
    },
    zScore: {
      min: 0,
      max: 0,
      mid: 0,
    },
  });
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setCNVFilters);
  const excludeChrXQuickFilter = useMemo<IGeneQuickFilter<ICNVSearchOptions>>(
    () => {
      const chromosomesWithoutX = chromosomes.filter((chromosome) => chromosome !== 'X');
      return {
        label: 'Exclude chrX',
        onClick: () => setCNVFilters((prev) => ({
          ...prev,
          chromosome: JSON.stringify(prev.chromosome) === JSON.stringify(chromosomesWithoutX)
            ? []
            : chromosomesWithoutX,
        })),
        checkIsActive: (filters) => (
          JSON.stringify(filters.chromosome) === JSON.stringify(chromosomesWithoutX)
        ),
        isDefault: false,
      };
    },
    [setCNVFilters],
  );

  const updateCnvSomaticSummary = useCallback(async () => {
    if (tumourBiosample?.biosampleId) {
      const snvSummaryData = await zeroDashSdk.cnv.somatic.getCuratedSampleSomaticCnvSummary(
        tumourBiosample.biosampleId,
      );
      setCnvSummary(snvSummaryData);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk.cnv.somatic]);

  const fetchCnvData = useCallback(async (page: number, limit: number): Promise<ISomaticCNV[]> => {
    if (!cnvfilters || !tumourBiosample?.biosampleId || defaultFiltersLoading) {
      return [];
    }

    const isDefault = (): boolean => JSON.stringify(cnvfilters) === JSON.stringify(defaultOptions);
    const mappedFilters = cnvfilters
      ? zeroDashSdk.cnv.somatic.mapCnvFilters(cnvfilters)
      : undefined;

    setLoading(true);
    const cnvData = await zeroDashSdk.cnv.somatic.getCnvRecords(
      {
        ...mappedFilters,
        defaultFilter: isDefault(),
      },
      tumourBiosample.biosampleId,
      page,
      limit,
    );
    updateCnvSomaticSummary();
    setLoading(false);
    return cnvData;
  }, [
    tumourBiosample?.biosampleId,
    cnvfilters,
    zeroDashSdk.cnv.somatic,
    updateCnvSomaticSummary,
    defaultFiltersLoading,
  ]);

  const handleUpdateCNV = async (
    body: IUpdateCNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (tumourBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.cnv.somatic.updateCnvRecordById(
          tumourBiosample.biosampleId,
          notifItem.variantId,
          newBody,
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, notifItem.reportable),
            defaultValue: reports,
            gene: notifItem.gene,
            geneList: somaticGeneList,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update CNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const mapping = (
    data: ISomaticCNV,
    key: number,
    updateCNV?: (cnv: ISomaticCNV) => void,
    setRefresh?: Dispatch<SetStateAction<boolean>>,
  ): ReactNode => (
    <CNVListItem
      summary={cnvSummary}
      data={data}
      key={key}
      updateCNV={updateCNV}
      setRefresh={setRefresh}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (tumourBiosample?.biosampleId) {
      await zeroDashSdk.cnv.somatic.clearCnvsPathclass(tumourBiosample.biosampleId);

      // forces fetchSnvData to run again and refresh list
      setCNVFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.cnv.somatic.getCuratedSampleSomaticCnvByVariantId(
          tumourBiosample.biosampleId,
          variantId,
        );
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [tumourBiosample?.biosampleId, search, zeroDashSdk]);

  useEffect(() => {
    updateCnvSomaticSummary();
  }, [updateCnvSomaticSummary]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (tumourBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = (): boolean => (
          JSON.stringify(cnvfilters) === JSON.stringify(defaultOptions)
        );

        const mappedFilters = cnvfilters
          ? zeroDashSdk.cnv.somatic.mapCnvFilters(cnvfilters)
          : undefined;
        const cnvCount = await zeroDashSdk.cnv.somatic.getCnvRecordsCount(
          {
            ...mappedFilters,
            defaultFilter: isDefault(),
          },
          tumourBiosample.biosampleId,
        );
        setTotalCount(cnvCount);
      }
    }
    if (cnvfilters) {
      getCounts();
    }
  }, [tumourBiosample?.biosampleId, cnvfilters, zeroDashSdk.cnv.somatic, defaultFiltersLoading]);

  useEffect(() => {
    const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);

    if (defaultFilter && tumourBiosample) {
      defaultOptions.genename = defaultFilter.geneList?.genes || [];
      setCNVFilters(defaultOptions);
      setDefaultFiltersLoading(false);
    }
  }, [panelAndHRFilters, tumourBiosample]);

  return (
    <div>
      <CNVSearchFilterBar
        toggled={cnvfilters || emptyOptions}
        setToggled={setCNVFilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        quickFilters={[...panelAndHRFilters, excludeChrXQuickFilter]}
        counts={{ current: count, total: totalCount }}
        loading={loading}
        setLoading={setLoading}
        setPathclassModalOpen={setPathclassModalOpen}
        disabled={!tumourBiosample}
      />
      <TabContentWrapper
        fetch={fetchCnvData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />
      {expanded && notifItem && tumourBiosample && (
        <ExpandedModal
          open={expanded}
          variantId={notifItem.variantId}
          variantType="CNV"
          biosampleId={tumourBiosample.biosampleId}
          variantGenes={[{
            gene: notifItem.gene,
            geneId: notifItem.geneId,
          }]}
          params={{
            cosmic: `/gene/analysis?ln=${notifItem.gene}`,
            clinvar: notifItem.gene,
            gnomad: `/gene/${notifItem.gene}`,
            oncokb: `/gene/${notifItem?.gene}`,
            pecan: `/proteinpaint/${notifItem?.gene}`,
            varSom: `/gene/${notifItem?.gene}`,
            civic: { gene: notifItem?.gene, variant: 'EXPRESSION' },
            geneCard: notifItem.gene,
            geneIds: [
              {
                name: notifItem.gene,
                value: notifItem.geneId,
              },
            ],
          }}
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
            <CNVModalLeft
              cnv={notifItem}
              handleUpdateData={handleUpdateCNV}
              summary={cnvSummary}
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
    </div>
  );
}
