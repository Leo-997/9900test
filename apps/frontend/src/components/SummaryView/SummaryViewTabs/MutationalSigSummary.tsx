import { makeStyles } from '@mui/styles';
import { ReactNode, useState, type JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { ISignatureData } from '../../../types/MutationalSignatures.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getMutSigSummary } from '../../../utils/misc/summaries';
import SignaturePanel from '../../MutationalSignatures/SignaturePanel';
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

export default function MutationalSigSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { mutsig } = useSummaryData();
  const { isReadOnly } = useCuration();

  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const row = (sig: ISignatureData): ReactNode => (
    <SignaturePanel data={sig} key={sig.signature} joined />
  );

  return (
    <Section
      label={label}
      count={mutsig?.length}
      loading={mutsig === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList defaultText="No significant mutation signatures to report">
        {mutsig?.map((sig: ISignatureData) => (
          <CustomTypography key={getMutSigSummary(sig)} variant="bodyRegular">
            {getMutSigSummary(sig)}
          </CustomTypography>
        ))}
      </TextList>

      {!canEdit && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'MUTATIONAL_SIG')}
          canEdit={canEdit}
        />
      )}

      <DataContentWrapper
        isLoading={mutsig === undefined}
        className={open ? classes.wrapper : classes.hide}
        row={row}
        items={mutsig}
      />
    </Section>
  );
}
