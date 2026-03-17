import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import { GermlineConsentChip } from '@/components/Chips/GermlineConsentChip';
import CustomTypography from '@/components/Common/Typography';
import CytogeneticsPanel from '@/components/Cytogenetics/CytogeneticsPanel';
import SVGermlineListItem from '@/components/SVGermline/SVGermlineListItem';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IParsedCytogeneticsData } from '@/types/Cytogenetics.types';
import { IGermlineSV, SVGermlineSummary } from '@/types/SV.types';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IGermlineCNV } from '../../../types/CNV.types';
import { ISummary } from '../../../types/Common.types';
import { IGermlineSNV, IReportableGermlineSNV } from '../../../types/SNV.types';
import { Sections } from '../../../types/Summary/Summary.types';
import {
  getCytobandSummary,
  getFusionSummary,
  getGermlineCnvSummary,
  getGermlineSnvSummary,
} from '../../../utils/misc/summaries';
import CNVGermlineListItem from '../../CNVGermline/CNVGermlineListItem';
import sortByGene from '../../Reports/Common/HelperFunctions/sortByGene';
import SNVGermlineListItem from '../../SNVGermline/SNVGermlineListItem';
import DataContentWrapper from '../SharedComponents/DataContentWrapper';
import Section from '../SharedComponents/Section';
import SummaryBox from '../SharedComponents/SummaryBox';
import TextList from '../SharedComponents/TextList';

const useStyles = makeStyles(() => ({
  wrapper: {
    border: '4px solid #FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    width: '100%',
  },
  hide: {
    display: 'none',
    height: 0,
  },
}));

// For type-narrowing the variants inside row()
type Variant = IGermlineCNV | IGermlineSNV | IGermlineSV | IParsedCytogeneticsData;
const has = <K extends PropertyKey>(k: K, o: object): o is Record<K, unknown> => k in o;
const isCyto = (v: Variant): v is IParsedCytogeneticsData => has('cytoband', v) && has('chr', v);
const isCNV = (v: Variant): v is IGermlineCNV => has('cnType', v);
const isSV = (v: Variant): v is IGermlineSV => has('svType', v);

interface ISectionProps {
  summary: string;
  label: string | JSX.Element;
  submitChanges: (
    newSummary: string,
    section: Sections
  ) => void;
}

export default function GermlineSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { germlineBiosample, demographics } = useAnalysisSet();
  const { isReadOnly } = useCuration();
  const zeroDashSdk = useZeroDashSdk();
  const {
    germlineSnvs,
    germlineSvs,
    germlineCnvs,
    germlineArmCnvs,
    reportableGermlineBands,
    targetableGermlineBands,
    germlineArmCnSummary,
  } = useSummaryData();

  const [snvData, setSnvData] = useState<IGermlineSNV[] | undefined>(undefined);
  const [cnvSummary, setCnvSummary] = useState<ISummary | undefined>(undefined);
  const [svGermlineSummary, setSVGermlinesummary] = useState<SVGermlineSummary>({
    matchedNormalId: '',
    maxScore: 0,
    minScore: 0,
    avgScore: 0,
  });
  const [open, setOpen] = useState<boolean>(false);

  const all = (germlineSnvs?.length || 0)
  + (germlineCnvs?.length || 0)
  + (germlineSvs?.length || 0)
  + (germlineArmCnvs?.length || 0)
  + (reportableGermlineBands?.length || 0);

  const variants = [
    ...(snvData || []),
    ...(germlineCnvs || []),
    ...(germlineSvs || []),
  ];

  const canEdit = useIsUserAuthorised('curation.sample.write');

  useEffect(() => {
    if (!snvData && open) {
      if (!germlineSnvs || germlineSnvs?.length === 0) {
        setSnvData([]);
      } else if (germlineBiosample?.biosampleId) {
        zeroDashSdk.snv.germline.getAllGermlineSnv(
          germlineBiosample.biosampleId,
          {
            variantIds: germlineSnvs?.map((snv) => snv.variantId),
            gene: germlineSnvs.map((snv) => snv.gene),
          },
        ).then((res) => {
          setSnvData(res);
        });
      }
    }
  }, [
    snvData,
    open,
    germlineSnvs,
    germlineBiosample?.biosampleId,
    zeroDashSdk.snv.germline,
  ]);

  useEffect(() => {
    if (!cnvSummary && germlineBiosample?.biosampleId) {
      zeroDashSdk.cnv.germline.getCuratedSampleGermlineCnvSummary(
        germlineBiosample.biosampleId,
      ).then((res) => {
        setCnvSummary(res);
      });
    }
  }, [cnvSummary, germlineBiosample?.biosampleId, zeroDashSdk.cnv.germline]);

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

  const row = (
    variant: IGermlineCNV | IGermlineSNV | IGermlineSV | IParsedCytogeneticsData,
  ): ReactNode => {
    if (isCyto(variant)) {
      return (
        <CytogeneticsPanel
          key={`germline-cytogenetics-${variant.chr}-${variant.cytoband}`}
          data={variant}
          biosampleId={germlineBiosample?.biosampleId}
          type="germline"
          updateCytogenetics={zeroDashSdk.cytogenetics.germline.updateCytogenetics}
          getCytobands={zeroDashSdk.cytogenetics.germline.getCytobands}
          reportableCytobands={
          reportableGermlineBands?.filter((cyto) => cyto.chr === variant.chr)
        }
          targetableCytobands={
          targetableGermlineBands?.filter((cyto) => cyto.chr === variant.chr)
        }
          view="summary"
          armCnSummary={germlineArmCnSummary}
        />
      );
    }
    if (isCNV(variant)) {
      return (
        <CNVGermlineListItem
          key={`germ-cnv-${variant.variantId}`}
          summary={cnvSummary}
          cnv={variant}
          joined
        />
      );
    }
    if (isSV(variant)) {
      return (
        <SVGermlineListItem
          key={variant.variantId}
          germlineSV={variant}
          minScore={svGermlineSummary?.minScore}
          maxScore={svGermlineSummary?.maxScore}
          joined
        />
      );
    }
    return (
      <SNVGermlineListItem
        key={variant.variantId}
        snv={variant}
        joined
      />
    );
  };

  return (
    <Section
      label={label}
      count={all}
      loading={
        germlineSnvs === undefined
        || germlineCnvs === undefined
        || germlineSvs === undefined
      }
      open={open}
      setOpen={setOpen}
      additionalHeaderContent={demographics && (
        <GermlineConsentChip germlineConsent={demographics} />
      )}
    >
      <TextList>
        {[
          ...(germlineSnvs
            ?.sort(sortByGene)
            ?.map((snv: IReportableGermlineSNV) => (
              <CustomTypography variant="bodyRegular" key={`${snv.variantId}-${snv.gene}`}>
                {getGermlineSnvSummary(snv)}
              </CustomTypography>
            )) || []),
          ...(germlineCnvs
            ?.sort(sortByGene)
            ?.map((cnv: IGermlineCNV) => (
              <CustomTypography variant="bodyRegular" key={`${cnv.variantId}-${cnv.geneId}`}>
                {getGermlineCnvSummary(cnv)}
              </CustomTypography>
            )) || []),
          ...(germlineSvs
            ?.sort((a, b) => {
              const startGeneDiff = sortByGene(a.startGene, b.startGene);
              const endGeneDiff = sortByGene(a.endGene, b.endGene);

              if (startGeneDiff === 0) return endGeneDiff;
              return startGeneDiff;
            })
            ?.map((sv: IGermlineSV) => (
              <CustomTypography variant="bodyRegular" key={`${sv.variantId}-${sv.internalId}`}>
                {getFusionSummary(sv)}
              </CustomTypography>
            )) || []),
          ...((germlineArmCnvs || []).flatMap((armCnv: IParsedCytogeneticsData) => {
            const summaryStrings = getCytobandSummary(
              armCnv,
              reportableGermlineBands?.filter((b) => b.chr === armCnv.chr) || [],
            );

            return summaryStrings.map((str) => (
              <Grid container direction="row" key={str.join(' ')}>
                <Grid size={{ xs: 3, xl: 2 }} style={{ paddingRight: '20px' }}>
                  <CustomTypography variant="bodyRegular">{str[0]}</CustomTypography>
                </Grid>
                <Grid size={{ xs: 4, xl: 3 }}>
                  <CustomTypography variant="bodyRegular">{str[1]}</CustomTypography>
                </Grid>
                <Grid size={1} style={{ paddingRight: '30px' }}>
                  <CustomTypography variant="bodyRegular">{str[2]}</CustomTypography>
                </Grid>
                <Grid size={3}>
                  <CustomTypography variant="bodyRegular">{str[3]}</CustomTypography>
                </Grid>
              </Grid>
            ));
          })),
        ]}
      </TextList>

      {(!canEdit || isReadOnly) && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'GERMLINE')}
          canEdit={canEdit && !isReadOnly}
        />
      )}

      <DataContentWrapper
        isLoading={(
          snvData === undefined
          || germlineCnvs === undefined
          || germlineSvs === undefined
        ) || variants === undefined}
        className={open ? classes.wrapper : classes.hide}
        row={row}
        items={[
          ...(snvData || []),
          ...(germlineCnvs || []),
          ...(germlineSvs || []),
          ...(germlineArmCnvs || []),
        ]}
      />
    </Section>
  );
}
