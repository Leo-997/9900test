import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  type JSX,
} from 'react';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useGetVariantQuickFilters from '@/hooks/QuickFilters/useGetVariantQuickFilters';
import {
  Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import { ISomaticSnv } from '../../types/SNV.types';
import { SnvListItem } from '../SNV/ListItem';
import SNVSearchFilterBar from '../SNV/SNVSearchFilterBar';

import { ImpactGroups, ISummary } from '../../types/Common.types';
import TabContentWrapper from './TabContentWrapper';

import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISNVSearchOptions } from '../../types/Search.types';
import getVariantId from '../../utils/functions/getVariantId';
import getVarsomPath from '../../utils/functions/getVarsomPath';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { IUpdateCuratedSampleSomaticSNVsByIdBody } from '../../utils/sdk/clients/curation/snv/somatic';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import { SNVModalContent } from '../SNV/ModalContent';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';

const emptyOptions: ISNVSearchOptions = {
  genesearchquery: '',
  chromosome: [],
  genename: [],
  classpath: [],
  consequence: [],
  gnomad: { min: 0, max: 1, defaults: [0, 1] },
  vaf: { min: 0, max: 1, defaults: [0, 1] },
  reads: { min: 0, max: Infinity, defaults: [0, Infinity] },
  platform: [],
  sortColumns: [],
  sortDirections: [],
};

const defaultOptions: ISNVSearchOptions = {
  ...emptyOptions,
  gnomad: { min: 0, max: 0.001, defaults: [0, 1] },
};

export default function SNVTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { somaticGeneList } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const {
    tumourBiosample,
  } = useAnalysisSet();

  const [loading, setLoading] = useState<boolean>(Boolean(tumourBiosample));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<ISomaticSnv>();
  const [cosmicLink, setCosmicLink] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [snvfilters, setSNVFilters] = useState<ISNVSearchOptions>(defaultOptions);
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(tumourBiosample),
  );
  const [snvHeliumSummary, setSnvHeliumSummary] = useState<ISummary>({ max: 0, min: 0, mid: 0 });
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setSNVFilters);

  const updateSnvHeliumSummary = useCallback(async () => {
    if (tumourBiosample?.biosampleId) {
      const snvSummaryData = await zeroDashSdk.snv.somatic.getCuratedSampleSomaticSnvHeliumSummary(
        tumourBiosample.biosampleId,
      );
      setSnvHeliumSummary(snvSummaryData);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk.snv.somatic]);

  const handleUpdateVariant = async (
    body: IUpdateCuratedSampleSomaticSNVsByIdBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (tumourBiosample?.biosampleId && notifItem?.internalId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.snv.somatic.updateCuratedSampleSomaticSnvById(
          newBody,
          tumourBiosample.biosampleId,
          notifItem.internalId,
        );
        setNotifItem((prev) => (prev ? ({ ...prev, ...newBody }) : prev));

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
        enqueueSnackbar('Cannot update SNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleParam = useCallback((): string => {
    if (notifItem?.hgvs) {
      const matches = notifItem?.hgvs.match(
        /(.+):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\s?(\((p\..[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\))?/,
      );

      if (matches && matches[2]) {
        const hvg = matches[2];

        return `${notifItem?.gene}:${hvg}`;
      }
    }
    return '';
  }, [notifItem?.gene, notifItem?.hgvs]);

  const fetchSnvData = useCallback(async (page: number, limit: number): Promise<ISomaticSnv[]> => {
    const isDefault = (): boolean => JSON.stringify(snvfilters) === JSON.stringify(defaultOptions);

    if (!snvfilters || !tumourBiosample?.biosampleId || defaultFiltersLoading) {
      return [];
    }

    const mappedFilters = snvfilters
      ? zeroDashSdk.snv.somatic.mapSnvFilters(snvfilters)
      : undefined;

    setLoading(true);
    const snvData = await zeroDashSdk.snv.somatic.getCuratedSampleSomaticSnvs(
      tumourBiosample.biosampleId,
      {
        ...mappedFilters,
        defaultFilter: isDefault(),
      },
      page,
      limit,
    );
    setLoading(false);
    return snvData;
  }, [
    defaultFiltersLoading,
    snvfilters,
    tumourBiosample?.biosampleId,
    zeroDashSdk.snv.somatic,
  ]);

  const mapping = (
    snv: ISomaticSnv,
    key: number,
    updateSNV?: (snv: ISomaticSnv) => void,
    setRefresh?: Dispatch<SetStateAction<boolean>>,
  ): ReactNode => (
    <SnvListItem
      key={key}
      snv={snv}
      summary={snvHeliumSummary}
      updateSNV={updateSNV}
      setRefresh={setRefresh}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (tumourBiosample?.biosampleId) {
      await zeroDashSdk.snv.somatic.clearSnvsPathclass(tumourBiosample.biosampleId);

      // forces fetchSnvData to run again and refresh list
      setSNVFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    updateSnvHeliumSummary();
  }, [updateSnvHeliumSummary]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (tumourBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = (): boolean => (
          JSON.stringify(snvfilters) === JSON.stringify(defaultOptions)
        );

        if (!snvfilters || !tumourBiosample?.biosampleId) return;

        const mappedFilters = snvfilters
          ? zeroDashSdk.snv.somatic.mapSnvFilters(snvfilters)
          : undefined;
        const snvCount = await zeroDashSdk.snv.somatic.getCuratedSampleSomaticSnvsCount(
          tumourBiosample.biosampleId,
          {
            ...mappedFilters,
            defaultFilter: isDefault(),
          },
        );
        setTotalCount(snvCount);
      }
    }
    if (snvfilters) {
      getCounts();
    }
  }, [
    snvfilters,
    tumourBiosample?.biosampleId,
    zeroDashSdk.snv,
    defaultFiltersLoading,
  ]);

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.snv.somatic.getCuratedSampleSomaticSnvByVariantId(
          tumourBiosample.biosampleId,
          variantId,
        );

        setCosmicLink(
          data.cosmicId
            ? `/search?q=${data.cosmicId}`
            : `/search?q=${handleParam()}`,
        );
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [tumourBiosample?.biosampleId, zeroDashSdk, search, handleParam]);

  useEffect(() => {
    async function getDefaultFilters(): Promise<void> {
      const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);
      const consequences = await zeroDashSdk.consequences.getConsequences() as ImpactGroups;
      defaultOptions.consequence = [...consequences.high, ...consequences.medium];

      if (defaultFilter && tumourBiosample) {
        defaultOptions.genename = defaultFilter.geneList?.genes || [];
        setSNVFilters(defaultOptions);
        setDefaultFiltersLoading(false);
      }
    }

    getDefaultFilters();
  }, [panelAndHRFilters, zeroDashSdk.consequences, tumourBiosample]);

  return (
    <Box sx={{ width: '100%' }}>
      <SNVSearchFilterBar
        toggled={snvfilters || emptyOptions}
        setToggled={setSNVFilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        quickFilters={panelAndHRFilters}
        counts={{ current: count, total: totalCount }}
        loading={loading}
        setLoading={setLoading}
        setPathclassModalOpen={setPathclassModalOpen}
        disabled={!tumourBiosample}
      />
      <TabContentWrapper
        fetch={fetchSnvData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />
      {expanded && notifItem && tumourBiosample && (
        <ExpandedModal
          open={expanded}
          variantId={notifItem.variantId}
          variantType="SNV"
          biosampleId={tumourBiosample.biosampleId}
          variantGenes={[{
            geneId: notifItem.geneId,
            gene: notifItem.gene,
          }]}
          handleClose={(): void => setExpanded(false)}
          variant={notifItem}
          handleUpdateVariant={handleUpdateVariant}
          curationDataComponent={(
            <SNVModalContent
              heliumSummary={snvHeliumSummary}
              handleUpdateData={handleUpdateVariant}
              snv={notifItem}
            />
          )}
          params={{
            cosmic: cosmicLink,
            clinvar: handleParam(),
            gnomad: `/gene/${handleParam()}`,
            oncokb: `/gene/${handleParam()}`,
            pecan: `/proteinpaint/${handleParam()}`,
            varSom: `${getVarsomPath(notifItem?.hgvs, 'somatic')}`,
            civic: { gene: notifItem.gene, variant: notifItem.hgvs },
            geneCard: notifItem.gene,
            geneIds: [
              {
                name: notifItem.gene,
                value: notifItem.geneId,
              },
            ],
          }}
          title="HGVS"
          titleContent={notifItem.hgvs}
          titleIcon={(
            <ConsequencePathclassIcon
              pathclass={notifItem.pathclass}
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
    </Box>
  );
}
