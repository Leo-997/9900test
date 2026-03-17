import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import useGetVariantQuickFilters from '@/hooks/QuickFilters/useGetVariantQuickFilters';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ImpactGroups } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISNVGermlineSearchOptions } from '../../types/Search.types';
import { IGermlineSNV } from '../../types/SNV.types';
import getVariantId from '../../utils/functions/getVariantId';
import getVarsomPath from '../../utils/functions/getVarsomPath';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { IUpdateGermlineSNVBody } from '../../utils/sdk/clients/curation/snv/germline';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import ClearPathclassModal from '../SearchFilterBar/Modals/ClearPathclassModal';
import SNVGermlineListItem from '../SNVGermline/SNVGermlineListItem';
import SNVGermLineModalLeft from '../SNVGermline/SNVGermlineModalLeft';
import SNVGermlineSearchFilterBar from '../SNVGermline/SNVGermlineSearchFilterBar';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: ISNVGermlineSearchOptions = {
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

const defaultOptions: ISNVGermlineSearchOptions = {
  ...emptyOptions,
  gnomad: { min: 0, max: 0.001, defaults: [0, 1] },
};

export default function SNVGermlineTabContent(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { search } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineGeneList } = useCuration();
  const { germlineBiosample, demographics } = useAnalysisSet();

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IGermlineSNV>();
  const [cosmicLink, setCosmicLink] = useState<string>('');
  const [
    snvGermlineFilters,
    setSNVGermlineFilters,
  ] = useState<ISNVGermlineSearchOptions>(defaultOptions);
  const [loading, setLoading] = useState<boolean>(Boolean(germlineBiosample));
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(germlineBiosample),
  );
  const [pathclassModalOpen, setPathclassModalOpen] = useState<boolean>(false);

  const { panelAndHRFilters } = useGetVariantQuickFilters(setSNVGermlineFilters, true);

  const handleUpdateData = async (
    body: IUpdateGermlineSNVBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.snv.germline.updateCuratedSampleGermlineSnvById(
          germlineBiosample?.biosampleId,
          newBody,
          {
            chromosome: notifItem.chr,
            position: notifItem.pos,
            ref: notifItem.snvRef,
            alt: notifItem.alt,
          },
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, notifItem.reportable),
            defaultValue: reports,
            gene: notifItem.gene,
            geneList: germlineGeneList,
            variantType: 'GERMLINE_SNV',
            germlineConsent: demographics,
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update SNV data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleParam = useCallback(() => {
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

  const getGermlineSnvData = useCallback(async (
    page: number,
    limit: number,
  ): Promise<IGermlineSNV[]> => {
    if (!snvGermlineFilters || defaultFiltersLoading) return [];
    if (germlineBiosample?.biosampleId) {
      const isDefault = (): boolean => (
        JSON.stringify(snvGermlineFilters) === JSON.stringify(defaultOptions)
      );
      const mappedFilters = snvGermlineFilters
        ? zeroDashSdk.snv.germline.mapSnvGermlineFilters(snvGermlineFilters)
        : undefined;

      setLoading(true);
      const germSnvData = await zeroDashSdk.snv.germline.getAllGermlineSnv(
        germlineBiosample.biosampleId,
        {
          ...mappedFilters,
          gene: mappedFilters?.gene || defaultOptions.genename.map((g) => g.gene),
          defaultFilter: isDefault(),
        },
        page,
        limit,
      );
      setLoading(false);
      return germSnvData;
    }
    return [];
  }, [
    defaultFiltersLoading,
    germlineBiosample?.biosampleId,
    snvGermlineFilters,
    zeroDashSdk.snv.germline,
  ]);

  const mapping = (
    item: IGermlineSNV,
    key: number,
    updateSNV?: (data: IGermlineSNV) => void,
  ): JSX.Element => (
    <SNVGermlineListItem
      key={key}
      snv={item}
      updateSNV={updateSNV}
    />
  );

  const handleClearPathclass = async (): Promise<void> => {
    if (germlineBiosample?.biosampleId) {
      await zeroDashSdk.snv.germline.clearSnvsPathclass(
        germlineBiosample.biosampleId,
      );

      // forces getGermlineSnvData to run again and refresh list
      setSNVGermlineFilters((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const cpra = getVariantId(search);
      if (cpra && germlineBiosample?.biosampleId) {
        const parts = cpra.split('|');
        if (parts.length === 4 && !Number.isNaN(parseInt(parts[1], 10))) {
          const data = await zeroDashSdk.snv.germline.getGermlineSnvByVariantId(
            germlineBiosample.biosampleId,
            {
              chromosome: parts[0],
              position: parseInt(parts[1], 10),
              ref: parts[2],
              alt: parts[3],
            },
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
    }
    getNotifItem();
  }, [germlineBiosample?.biosampleId, handleParam, search, zeroDashSdk.snv.germline]);

  useEffect(() => {
    async function getDefaultFilters(): Promise<void> {
      const defaultFilter = panelAndHRFilters.find((f) => f.isDefault);

      const consequences = await zeroDashSdk.consequences.getConsequences() as ImpactGroups;
      defaultOptions.consequence = [...consequences.high, ...consequences.medium];

      if (defaultFilter && germlineBiosample) {
        defaultOptions.genename = defaultFilter.geneList?.genes || [];
        setSNVGermlineFilters(defaultOptions);
        setDefaultFiltersLoading(false);
      }
    }

    getDefaultFilters();
  }, [germlineBiosample, panelAndHRFilters, zeroDashSdk.consequences]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (germlineBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = (): boolean => (
          JSON.stringify(snvGermlineFilters) === JSON.stringify(defaultOptions)
        );
        const mappedFilters = snvGermlineFilters
          ? zeroDashSdk.snv.germline.mapSnvGermlineFilters(snvGermlineFilters)
          : undefined;

        const germSnvCount = await zeroDashSdk.snv.germline.getAllGermlineSnvCount(
          germlineBiosample.biosampleId,
          {
            ...mappedFilters,
            gene: mappedFilters?.gene || defaultOptions.genename.map((g) => g.gene),
            defaultFilter: isDefault(),
          },
        );
        setTotalCount(germSnvCount);
      }
    }
    if (snvGermlineFilters) {
      getCounts();
    }
  }, [
    defaultFiltersLoading,
    germlineBiosample?.biosampleId,
    snvGermlineFilters,
    zeroDashSdk.snv.germline,
  ]);

  return (
    <div>
      <SNVGermlineSearchFilterBar
        toggled={snvGermlineFilters || emptyOptions}
        setToggled={setSNVGermlineFilters}
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
        fetch={getGermlineSnvData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />
      {expanded && notifItem && germlineBiosample && (
        <ExpandedModal
          open={expanded}
          variantId={notifItem.variantId}
          variantType="GERMLINE_SNV"
          biosampleId={germlineBiosample.biosampleId}
          variantGenes={[{
            gene: notifItem.gene,
            geneId: notifItem.geneId,
          }]}
          handleClose={(): void => setExpanded(false)}
          variant={notifItem}
          handleUpdateVariant={handleUpdateData}
          curationDataComponent={(
            <SNVGermLineModalLeft
              handleUpdateData={handleUpdateData}
              snv={notifItem}
            />
          )}
          params={{
            cosmic: cosmicLink,
            clinvar: handleParam(),
            gnomad: `/gene/${handleParam()}`,
            oncokb: `/gene/${handleParam()}`,
            pecan: `/proteinpaint/${handleParam()}`,
            varSom: `${getVarsomPath(notifItem?.hgvs, 'germline')}`,
            civic: { gene: notifItem.gene, variant: notifItem.hgvs },
            geneCard: notifItem.gene,
            geneIds: [
              {
                name: notifItem.gene,
                value: notifItem.geneId,
              },
            ],
          }} // should provide a valid gene
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
    </div>
  );
}
