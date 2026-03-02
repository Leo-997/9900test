import { Chromosome } from '@/types/Common.types';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useLocation } from 'react-router-dom';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import {
  IArmCNSummary, ICytogeneticsData, IParsedCytogeneticsData, ISampleCytoband,
} from '../../types/Cytogenetics.types';
import { ReportType } from '../../types/Reports/Reports.types';
import getVariantId from '../../utils/functions/getVariantId';
import { parseCytoData } from '../../utils/functions/parseCytoData';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import CytogeneticsLegend from '../Cytogenetics/CytogeneticsLegend';
import CytogeneticsModal from '../Cytogenetics/CytogeneticsModal';
import CytogeneticsPanel from '../Cytogenetics/CytogeneticsPanel';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import TabContentWrapper from './TabContentWrapper';

export default function CytogeneticsTabContent(): JSX.Element {
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { tumourBiosample } = useAnalysisSet();

  const [reportableCytobands, setReportableCytobands] = useState<ISampleCytoband[]>([]);
  const [targetableCytobands, setTargetableCytobands] = useState<ISampleCytoband[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IParsedCytogeneticsData>();
  const [armCnSummary, setArmCnSummary] = useState<IArmCNSummary>();

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && tumourBiosample?.biosampleId) {
        const data = await zeroDashSdk.cytogenetics.somatic.getCytogeneticsByChromosome(
          tumourBiosample.biosampleId,
          variantId,
        );
        const genesData = await zeroDashSdk.cytogenetics.somatic.getAnnotationsByChromosome(
          tumourBiosample.biosampleId,
          variantId,
        );
        const newCytoData = parseCytoData(data, genesData);
        setNotifItem(newCytoData[0]);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [tumourBiosample?.biosampleId, search, zeroDashSdk.cytogenetics.somatic]);

  const fetchCytogeneticsData = useCallback(async (page) => {
    if (tumourBiosample?.biosampleId && page === 1) {
      const data = await zeroDashSdk.cytogenetics.somatic.getCytogeneticsData(
        tumourBiosample.biosampleId,
      );
      const genesData = await zeroDashSdk.cytogenetics.somatic.getAnnotations(
        tumourBiosample.biosampleId,
      );
      const newCytoData = parseCytoData(data, genesData);

      const reportables = await zeroDashSdk.cytogenetics.somatic.getCytobands(
        tumourBiosample.biosampleId,
        {
          reportable: true,
        },
      );
      setReportableCytobands(reportables);

      const targetables = await zeroDashSdk.cytogenetics.somatic.getCytobands(
        tumourBiosample.biosampleId,
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
  }, [tumourBiosample?.biosampleId, zeroDashSdk.cytogenetics]);

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
          biosampleId={tumourBiosample?.biosampleId}
          updateCytogenetics={zeroDashSdk.cytogenetics.somatic.updateCytogenetics}
          getCytobands={zeroDashSdk.cytogenetics.somatic.getCytobands}
          type="somatic"
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
    if (tumourBiosample?.biosampleId && notifItem) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(
            body,
            arm === 'p' ? notifItem.p.reportable : notifItem.q.reportable,
          ),
        };
        await zeroDashSdk.cytogenetics.somatic.updateCytogenetics(
          {
            chr: chromosome,
            arm,
            ...newBody,
          },
          tumourBiosample.biosampleId,
        );
        const newReports: ReportType[] = [];
        if (reports) {
          newReports.push(...getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(
              body,
              arm === 'p' ? notifItem.p.reportable : notifItem.q.reportable,
            ),
            defaultValue: reports,
          }));
        }
        return newReports;
      } catch {
        enqueueSnackbar(
          'Cannot update cytogenetics data, please try again.',
          { variant: 'error' },
        );
      }
    }
    return [];
  };

  return (
    <>
      {armCnSummary && <CytogeneticsLegend armCnSummary={armCnSummary} /> }
      <TabContentWrapper
        fetch={fetchCytogeneticsData}
        mapping={mapping}
      />
      {expanded && tumourBiosample && notifItem
        && (
        <ExpandedModal
          variantId={notifItem.chr}
          variantType="CYTOGENETICS"
          biosampleId={tumourBiosample.biosampleId}
          open={expanded}
          handleClose={(): void => setExpanded(false)}
          title="CHROMOSOME"
          titleContent={notifItem.chr}
          curationDataComponent={(
            armCnSummary
              ? (
                <CytogeneticsModal
                  data={notifItem}
                  type="somatic"
                  biosampleId={tumourBiosample?.biosampleId}
                  getCytobands={zeroDashSdk.cytogenetics.somatic.getCytobands}
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
