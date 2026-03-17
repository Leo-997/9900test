import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { Chromosome } from '@/types/Common.types';
import {
  IArmCNSummary, ICytogeneticsData, IParsedCytogeneticsData, ISampleCytoband,
} from '@/types/Cytogenetics.types';
import { ReportType } from '@/types/Reports/Reports.types';
import getVariantId from '@/utils/functions/getVariantId';
import { parseCytoData } from '@/utils/functions/parseCytoData';
import getUpdatedReportableValue from '@/utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '@/utils/functions/reportable/getUpdatedReportsValue';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import CytogeneticsLegend from '../Cytogenetics/CytogeneticsLegend';
import CytogeneticsModal from '../Cytogenetics/CytogeneticsModal';
import CytogeneticsPanel from '../Cytogenetics/CytogeneticsPanel';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import TabContentWrapper from './TabContentWrapper';

export default function CytogeneticsGermlineTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { germlineBiosample, demographics } = useAnalysisSet();

  const [reportableCytobands, setReportableCytobands] = useState<ISampleCytoband[]>([]);
  const [targetableCytobands, setTargetableCytobands] = useState<ISampleCytoband[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IParsedCytogeneticsData>();
  const [armCnSummary, setArmCnSummary] = useState<IArmCNSummary>();

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && germlineBiosample?.biosampleId) {
        const data = await zeroDashSdk.cytogenetics.germline.getCytogeneticsByChromosome(
          germlineBiosample.biosampleId,
          variantId,
        );
        const newCytoData = parseCytoData(data);

        setNotifItem(newCytoData[0]);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [germlineBiosample?.biosampleId, search, zeroDashSdk.cytogenetics.germline]);

  const fetchCytogeneticsData = useCallback(async (page: number) => {
    if (germlineBiosample?.biosampleId && page === 1) {
      const data = await zeroDashSdk.cytogenetics.germline.getCytogeneticsData(
        germlineBiosample.biosampleId,
      );
      const newCytoData = parseCytoData(data);

      const reportables = await zeroDashSdk.cytogenetics.germline.getCytobands(
        germlineBiosample.biosampleId,
        {
          reportable: true,
        },
      );
      setReportableCytobands(reportables);

      const targetables = await zeroDashSdk.cytogenetics.germline.getCytobands(
        germlineBiosample.biosampleId,
        {
          targetable: true,
        },
      );
      setTargetableCytobands(targetables);
      setArmCnSummary({
        p: {
          min: Math.min(...newCytoData.map((d) => d.p.avgCN)),
          max: Math.max(...newCytoData.map((d) => d.p.avgCN)),
        },
        q: {
          min: Math.min(...newCytoData.map((d) => d.q.avgCN)),
          max: Math.max(...newCytoData.map((d) => d.q.avgCN)),
        },
      });
      return newCytoData;
    }
    return [];
  }, [germlineBiosample?.biosampleId, zeroDashSdk.cytogenetics.germline]);

  const mapping = (
    data: IParsedCytogeneticsData,
    index: number,
    updateCyto?: (value: IParsedCytogeneticsData) => void,
  ): ReactNode => (
    armCnSummary
      ? (
        <CytogeneticsPanel
          key={`${data.chr}-${data.p?.avgCN}-${data.q?.avgCN}-${data.cytoband || 'NA'}-${index}`}
          data={data}
          biosampleId={germlineBiosample?.biosampleId}
          updateCytogenetics={zeroDashSdk.cytogenetics.germline.updateCytogenetics}
          getCytobands={zeroDashSdk.cytogenetics.germline.getCytobands}
          type="germline"
          updateCyto={updateCyto}
          reportableCytobands={reportableCytobands.filter((c) => c.chr === data.chr)}
          targetableCytobands={targetableCytobands.filter((c) => c.chr === data.chr)}
          armCnSummary={armCnSummary}
        />
      ) : (
        <div />
      )
  );

  const handleUpdateCyto = async (
    body: Partial<ICytogeneticsData>,
    chromosome: Chromosome,
    arm: string,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (germlineBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(
            body,
            arm === 'p' ? notifItem.p.reportable : notifItem.q.reportable,
          ),
        };
        await zeroDashSdk.cytogenetics.germline.updateCytogenetics(
          {
            chr: chromosome,
            arm,
            ...newBody,
          },
          germlineBiosample.biosampleId,
        );
        const newReports: ReportType[] = [];
        if (reports) {
          newReports.push(...getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(
              body,
              arm === 'p' ? notifItem.p.reportable : notifItem.q.reportable,
            ),
            defaultValue: reports,
            germlineConsent: demographics,
          }));
        }
        return newReports;
      } catch {
        enqueueSnackbar(
          'Cannot update germline cytogenetics data, please try again.',
          { variant: 'error' },
        );
      }
    }
    return [];
  };

  return (
    <>
      {armCnSummary && <CytogeneticsLegend armCnSummary={armCnSummary} />}
      <TabContentWrapper
        fetch={fetchCytogeneticsData}
        mapping={mapping}
      />
      {expanded && germlineBiosample && notifItem
        && (
        <ExpandedModal
          variantId={notifItem.chr}
          variantType="GERMLINE_CYTO"
          biosampleId={germlineBiosample.biosampleId}
          open={expanded}
          handleClose={(): void => setExpanded(false)}
          title="CHROMOSOME"
          titleContent={notifItem.chr}
          curationDataComponent={(
            armCnSummary
              ? (
                <CytogeneticsModal
                  data={notifItem}
                  type="germline"
                  biosampleId={germlineBiosample?.biosampleId}
                  getCytobands={zeroDashSdk.cytogenetics.germline.getCytobands}
                  armCnSummary={armCnSummary}
                  handleUpdateCyto={handleUpdateCyto}
                />
              ) : <div />
          )}
          overrideFooter={(<div />)}
          overrideType="cyto"
        />
        )}
    </>
  );
}
