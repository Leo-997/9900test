import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  useEffect, useMemo, useState, type JSX,
} from 'react';
import { ICurationSummary } from '@/types/Analysis/AnalysisSets.types';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useSummaryData } from '../../contexts/SummaryDataContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IFilter, IFilters, Sections } from '../../types/Summary/Summary.types';
import StatusChip from '../Chips/StatusChip';
import CurationMeeting from './SummaryViewTabs/CurationMeeting';
import CytogeneticsSummary from './SummaryViewTabs/CytogeneticsSummary';
import GermlineSummary from './SummaryViewTabs/GermlineSummary';
import HTSSummary from './SummaryViewTabs/HTS';
import MethylationSummary from './SummaryViewTabs/MethylationSummary';
import MolecularSummaryTab from './SummaryViewTabs/MolecularReportSummaryTab';
import MTBMeeting from './SummaryViewTabs/MTBMeeting';
import MutationalSigSummary from './SummaryViewTabs/MutationalSigSummary';
import SomaticCnvSummary from './SummaryViewTabs/SomaticCnvSummary';
import SomaticRnaSummary from './SummaryViewTabs/SomaticRnaSummary';
import SomaticSnvSummary from './SummaryViewTabs/SomaticSnvSummary';
import SomaticSvSummary from './SummaryViewTabs/SomaticSvSummary';

const useStyles = makeStyles(() => ({
  body: {
    position: 'relative',
  },
  filterScroll: {
    maxHeight: 'calc(100vh - 80px)',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: 12,
  },
  fullHeight: {
    height: 'calc(100vh - 128px)',
  },
  filters: {
    paddingTop: 24,
    paddingBottom: 24,
    width: '100%',
    height: '100%',
  },
  hide: {
    display: 'none',
    height: 0,
  },
  toggleIcon: {
    color: 'inherit',
    height: 14,
    width: 14,
  },
  section: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  chipLabel: {
    color: 'inherit',
  },
}));

export interface ISummaryRef {
  filters: IFilters;
  changeFilter: (filter: IFilter) => void;
  currentFilter?: IFilter;
}

function SummaryTabContent(): JSX.Element {
  const classes = useStyles();
  const { analysisSet, tumourBiosample } = useAnalysisSet();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { classifiers } = useSummaryData();

  // Variant filter, impacts button style
  const [summaries, setSummaries] = useState<ICurationSummary[]>();

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getSummaries(
      analysisSet.analysisSetId,
    ).then((res) => {
      setSummaries(res);
    })
      .catch(() => {
        setSummaries([]);
      });
  }, [analysisSet.analysisSetId, zeroDashSdk.curation.analysisSets]);

  const methProviderId = classifiers?.find((c) => c.providerId?.length)?.providerId;

  // Setup column order and initial value
  const labels: { [key in Sections]: string | JSX.Element } = useMemo(() => ({
    SNV: 'Somatic Mutation',
    CNV: 'Copy Number',
    SV: 'Fusions & Disruptions',
    RNA_SEQ: 'RNASeq',
    CYTOGENETICS: 'Cytogenetics',
    GERMLINE: 'Germline Mutation',
    METHYLATION: methProviderId
      ? (
        <>
          Methylation
          {' '}
          <StatusChip
            status={methProviderId}
            backgroundColor={methProviderId === 'AGRF' ? '#FADEF6' : '#BBDEFF'}
            color={methProviderId === 'AGRF' ? '#AD239D' : '#08317E'}
          />
        </>
      )
      : 'Methylation',
    MUTATIONAL_SIG: 'Mutational Signatures',
    CURATION_MEETING: 'Curation Meeting Comments',
    HTS: 'HTS',
    MTB_MEETING: 'MTB Meeting Comments',
  }), [methProviderId]);

  const submitChanges = async (
    newSummary: string,
    section: Sections,
    date?: string,
  ): Promise<void> => {
    if (section) {
      try {
        await zeroDashSdk.curation.analysisSets.updateSummary(
          analysisSet.analysisSetId,
          {
            type: section,
            note: newSummary,
            date,
          },
        );
        enqueueSnackbar('Curator Note Saved', { variant: 'success' });
        setSummaries((prev) => {
          const prevSummary = prev?.find((s) => s.type === section);
          if (prevSummary) {
            return prev?.map((s) => (
              s.type === prevSummary.type
                ? { ...s, note: newSummary, date }
                : s
            ));
          }
          return [
            ...(prev || []),
            {
              analysisSetId: analysisSet.analysisSetId,
              note: newSummary,
              type: section,
              date,
            },
          ];
        });
      } catch (err) {
        enqueueSnackbar('Unable to save summary, please try again later.', { variant: 'error' });
      }
    }
  };

  return (
    <Grid
      container
      wrap="nowrap"
      className={classes.body}
      style={{ width: '100%' }}
    >
      <Grid size={12} padding="0px 24px" container direction="column">
        <SomaticSnvSummary
          summary={summaries?.find((s) => s.type === 'SNV')?.note || ''}
          label={labels.SNV}
          submitChanges={submitChanges}
        />
        <SomaticCnvSummary
          summary={summaries?.find((s) => s.type === 'CNV')?.note || ''}
          label={labels.CNV}
          submitChanges={submitChanges}
        />
        <SomaticSvSummary
          summary={summaries?.find((s) => s.type === 'SV')?.note || ''}
          label={labels.SV}
          submitChanges={submitChanges}
        />
        <SomaticRnaSummary
          summary={summaries?.find((s) => s.type === 'RNA_SEQ')?.note || ''}
          label={labels.RNA_SEQ}
          submitChanges={submitChanges}
        />
        <CytogeneticsSummary
          summary={summaries?.find((s) => s.type === 'CYTOGENETICS')?.note || ''}
          label={labels.CYTOGENETICS}
          submitChanges={submitChanges}
          biosampleId={tumourBiosample?.biosampleId}
        />
        <MethylationSummary
          summary={summaries?.find((s) => s.type === 'METHYLATION')?.note || ''}
          label={labels.METHYLATION}
          submitChanges={submitChanges}
        />
        <GermlineSummary
          summary={summaries?.find((s) => s.type === 'GERMLINE')?.note || ''}
          label={labels.GERMLINE}
          submitChanges={submitChanges}
        />
        <MutationalSigSummary
          summary={summaries?.find((s) => s.type === 'MUTATIONAL_SIG')?.note || ''}
          label={labels.MUTATIONAL_SIG}
          submitChanges={submitChanges}
        />
        <CurationMeeting
          summary={summaries?.find((s) => s.type === 'CURATION_MEETING')}
          label={labels.CURATION_MEETING}
          submitChanges={submitChanges}
        />
        <MolecularSummaryTab label="Molecular Report Summary" />
        <HTSSummary
          summary={summaries?.find((s) => s.type === 'HTS')}
          label={labels.HTS}
          submitChanges={submitChanges}
        />
        <MTBMeeting
          summary={summaries?.find((s) => s.type === 'MTB_MEETING')}
          label={labels.MTB_MEETING}
          submitChanges={submitChanges}
        />
      </Grid>
    </Grid>
  );
}

export default SummaryTabContent;
