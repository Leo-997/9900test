import {
  ReactNode, useCallback, useEffect, useState, type JSX,
} from 'react';

import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ISummary } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISomaticRna, IUpdateRnaSeqBody } from '../../types/RNAseq.types';
import { IRNASeqSearchOptions } from '../../types/Search.types';
import getVariantId from '../../utils/functions/getVariantId';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import GeneExpressionIcon from '../CustomIcons/GeneExpressionIcon';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import AddGene from '../RNASeq/AddGene';
import PairedBanner from '../RNASeq/RelapseComparison/PariedBanner';
import RNASeqCard from '../RNASeq/RNASeqCard';
import RNASeqModalLeft from '../RNASeq/RNASeqModalLeft';
import RNASeqSearchFilterBar from '../RNASeqSearchFilter/RNASeqSearchFilter';
import TabContentWrapper from './TabContentWrapper';

const emptyOptions: IRNASeqSearchOptions = {
  genesearchquery: '',
  chromosome: [],
  genename: [],
  geneExpression: [],
  foldChange: {
    min: -Infinity,
    max: Infinity,
    defaults: [-Infinity, Infinity],
  },
  zScore: {
    min: -Infinity,
    max: Infinity,
    defaults: [-Infinity, Infinity],
  },
  tpm: {
    min: -Infinity,
    max: Infinity,
    defaults: [-Infinity, Infinity],
  },
  fpkm: {
    min: -Infinity,
    max: Infinity,
    defaults: [-Infinity, Infinity],
  },
  sortColumns: [],
  sortDirections: [],
};

const defaultOptions: IRNASeqSearchOptions = {
  ...emptyOptions,
};

export default function RNASeqTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { rnaBiosample, analysisSet } = useAnalysisSet();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(Boolean(rnaBiosample));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<ISomaticRna>();
  const [plot, setPlot] = useState<string>();
  const [uploadStatus, setUploadStatus] = useState<boolean>(false);
  const [plotsShown, setPlotsShown] = useState<boolean>(true);
  const [rnaseqfilters, setRnaseqfilters] = useState<IRNASeqSearchOptions>(defaultOptions);
  const [originalBiosampleId, setoriginalBiosampleId] = useState<string>('');

  const [rnaSummary, setRnaSummary] = useState<ISummary>({
    min: 0,
    mid: 0,
    max: 0,
  });
  const [geneExpression, setGeneExpression] = useState<string | null>(
    notifItem?.geneExpression || null,
  );
  const [defaultFiltersLoading, setDefaultFiltersLoading] = useState<boolean>(
    Boolean(rnaBiosample),
  );

  const canEdit = useIsUserAuthorised('curation.sample.download', isAssignedCurator);

  const handleUpdateRNA = async (
    body: IUpdateRnaSeqBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (rnaBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, notifItem.reportable),
        };
        await zeroDashSdk.rna.updateRnaSeq(
          newBody,
          rnaBiosample.biosampleId,
          notifItem.geneId,
        );
        setNotifItem((prev) => (prev ? { ...prev, ...newBody } : prev));

        let newReports: ReportType[] = [];
        if (reports) {
          newReports = getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(body, notifItem.reportable),
            defaultValue: reports,
            gene: notifItem.gene,
            genePanel: analysisSet.genePanel,
            variantType: 'RNA_SEQ',
          });
        }
        return newReports;
      } catch {
        enqueueSnackbar('Cannot update RNA data, please try again.', { variant: 'error' });
      }
    }
    return [];
  };

  const handleGraphUpload = async (file: File): Promise<void> => {
    if (notifItem?.geneId && rnaBiosample?.biosampleId) {
      const response = await zeroDashSdk.plots.postRNASeqGenePlot(
        file,
        rnaBiosample.biosampleId,
        notifItem.geneId,
      );
      if (response.status === 201) {
        setPlot(response.data.plotURL);
        setUploadStatus(true);
        enqueueSnackbar('Successfully uploaded', { variant: 'success' });
      } else {
        setUploadStatus(false);
        enqueueSnackbar('File upload error', { variant: 'error' });
      }
    }
  };

  const mapping = (
    rnaData: ISomaticRna,
    index: number,
    updateRNA?: (rna: ISomaticRna) => void,
  ): ReactNode => (
    <RNASeqCard
      rnaSummary={rnaSummary}
      key={index}
      rna={rnaData}
      updateRNA={updateRNA}
      plotsShown={plotsShown}
    />
  );

  const fetchRnaSeqData = useCallback(async (page: number, limit: number) => {
    const isDefault = (): boolean => (
      JSON.stringify(rnaseqfilters) === JSON.stringify(defaultOptions)
    );

    if (!rnaseqfilters || defaultFiltersLoading || !rnaBiosample?.biosampleId) {
      setLoading(false);
      return [];
    }

    const mappedFilters = rnaseqfilters
      ? zeroDashSdk.rna.mapRNASeqFilters(rnaseqfilters)
      : undefined;

    setLoading(true);

    const rnaSeqData = await zeroDashSdk.rna.getRnaSeqData(
      rnaBiosample.biosampleId,
      page,
      limit,
      {
        ...mappedFilters,
        defaultFilter: isDefault(),
      },
    );
    setLoading(false);

    setoriginalBiosampleId([...new Set(rnaSeqData.map((item) => item.pairedSample))].join(' '));

    return rnaSeqData;
  }, [defaultFiltersLoading, rnaBiosample?.biosampleId, rnaseqfilters, zeroDashSdk.rna]);

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = parseInt(getVariantId(search), 10);
      if (variantId && rnaBiosample?.biosampleId && rnaBiosample.biosampleId) {
        const data = await zeroDashSdk.rna.getRnaSeqDataByGeneId(
          rnaBiosample.biosampleId,
          variantId,
          true,
        );
        try {
          const plotResp = await zeroDashSdk.plots.getRNASeqGenePlot(
            rnaBiosample.biosampleId,
            variantId,
          );
          setPlot(plotResp);
        } catch {
          setPlot('');
        }
        setNotifItem(data);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [rnaBiosample?.biosampleId, zeroDashSdk, search]);

  useEffect(() => {
    async function getCounts(): Promise<void> {
      if (rnaBiosample?.biosampleId && !defaultFiltersLoading) {
        const isDefault = (): boolean => (
          JSON.stringify(rnaseqfilters) === JSON.stringify(defaultOptions)
        );

        const mappedFilters = rnaseqfilters
          ? zeroDashSdk.rna.mapRNASeqFilters(rnaseqfilters)
          : undefined;
        const rnaSeqCount = await zeroDashSdk.rna.getRnaSeqDataCount(
          rnaBiosample.biosampleId,
          {
            ...mappedFilters,
            defaultFilter: isDefault(),
          },
        );
        setTotalCount(rnaSeqCount);
      }
    }
    if (rnaseqfilters) {
      getCounts();
    }
  }, [rnaBiosample?.biosampleId, rnaseqfilters, zeroDashSdk.rna, defaultFiltersLoading]);

  useEffect(() => {
    async function updateRNASummary(): Promise<void> {
      if (rnaBiosample?.biosampleId) {
        const rnaSummaryData = await zeroDashSdk.rna.getRnaSampleSummary(
          rnaBiosample.biosampleId,
        );
        setRnaSummary(rnaSummaryData);
      }
    }
    updateRNASummary();
  }, [rnaBiosample?.biosampleId, zeroDashSdk.rna]);

  useEffect(() => {
    async function getDefaultFilters(): Promise<void> {
      const list = await zeroDashSdk.services.reports.getGeneLists({
        type: 'rna',
        isActive: true,
      });

      if (list.length > 0 && list[0].genes?.length) {
        defaultOptions.genename = list[0].genes;
      }

      setRnaseqfilters(defaultOptions);
      setDefaultFiltersLoading(false);
    }

    if (rnaBiosample) {
      getDefaultFilters();
    }
  }, [zeroDashSdk.gene, zeroDashSdk.services.reports, rnaBiosample]);

  return (
    <div>
      <RNASeqSearchFilterBar
        toggled={rnaseqfilters || emptyOptions}
        setToggled={setRnaseqfilters}
        emptyOptions={emptyOptions}
        defaultOptions={defaultOptions}
        counts={{ current: count, total: totalCount }}
        loading={loading}
        setLoading={setLoading}
        disabled={!rnaBiosample}
        handleHidePlots={(hidden: boolean): void => setPlotsShown(!hidden)}
      />

      {canEdit && (
        <AddGene />
      )}
      { originalBiosampleId && rnaBiosample && !isReadOnly && (
        <PairedBanner originalBiosampleId={originalBiosampleId} />
      )}
      <TabContentWrapper
        fetch={fetchRnaSeqData}
        updateCount={setCount}
        mapping={mapping}
        parentLoading={loading}
      />

      {expanded && rnaBiosample && notifItem && (
        <ExpandedModal
          open={expanded}
          titleIcon={
            <GeneExpressionIcon expression={geneExpression} />
          }
          title="GENE"
          titleContent={notifItem.gene}
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
          curationDataComponent={(
            <RNASeqModalLeft
              data={notifItem}
              rnaSummary={rnaSummary}
              imgUrl={plot}
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
              handleGraphUpload={handleGraphUpload}
              handleUpdateData={handleUpdateRNA}
              setGeneExpression={setGeneExpression}
            />
          )}
          variantType="RNA_SEQ"
          variantId={notifItem.geneId}
          biosampleId={rnaBiosample.biosampleId}
          variant={notifItem}
          variantGenes={[{
            gene: notifItem.gene,
            geneId: notifItem.geneId,
          }]}
          handleUpdateVariant={handleUpdateRNA}
          handleClose={(): void => setExpanded(false)}
        />
      )}
    </div>
  );
}
