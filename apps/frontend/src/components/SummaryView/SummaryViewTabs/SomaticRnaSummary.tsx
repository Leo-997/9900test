import { makeStyles } from '@mui/styles';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import CustomTypography from '@/components/Common/Typography';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { ISummary } from '../../../types/Common.types';
import { IRNAClassifierTable, ISomaticRna } from '../../../types/RNAseq.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getRNAClassifierSummary, getRNASummary } from '../../../utils/misc/summaries';
import sortByGene from '../../Reports/Common/HelperFunctions/sortByGene';
import RNASeqCard from '../../RNASeq/RNASeqCard';
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

interface ISectionProps {
  summary: string;
  label: string | JSX.Element;
  submitChanges: (
    newSummary: string,
    section: Sections
  ) => void;
}

export default function SomaticRnaSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample } = useAnalysisSet();
  const { isReadOnly } = useCuration();
  const { rna, rnaClassifiers } = useSummaryData();

  const [rnaSummary, setRnaSummary] = useState<ISummary | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  useEffect(() => {
    if (!rnaSummary && rnaBiosample?.biosampleId) {
      zeroDashSdk.rna.getRnaSampleSummary(
        rnaBiosample.biosampleId,
      ).then((res) => {
        setRnaSummary(res);
      });
    }
  }, [rnaSummary, rnaBiosample?.biosampleId, zeroDashSdk]);

  const row = (rnaItem: ISomaticRna): ReactNode => rna && (
    <RNASeqCard
      rnaSummary={rnaSummary || { min: 0, max: 0, mid: 0 }}
      key={`rna-${rnaItem.gene}`}
      rna={rnaItem}
      joined
      plotsShown
    />
  );
  const rnaCount = (rna?.length || 0) + (rnaClassifiers?.length || 0);
  return (
    <Section
      label={label}
      count={rnaCount}
      loading={rna === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList>
        {rna
          ?.sort(sortByGene)
          ?.map((r: ISomaticRna) => (
            <CustomTypography key={getRNASummary(r)} variant="bodyRegular">{getRNASummary(r)}</CustomTypography>
          ))}
        {rnaClassifiers
          ?.map((r: IRNAClassifierTable) => (
            <CustomTypography key={getRNAClassifierSummary(r)} variant="bodyRegular">{getRNAClassifierSummary(r)}</CustomTypography>
          ))}
      </TextList>

      {!canEdit && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'RNA_SEQ')}
          canEdit={canEdit}
        />
      )}

      <DataContentWrapper
        isLoading={rna === undefined || rna === undefined}
        className={open ? classes.wrapper : classes.hide}
        row={row}
        items={rna}
      />
    </Section>
  );
}
