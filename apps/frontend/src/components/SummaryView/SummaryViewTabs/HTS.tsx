import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ICurationSummary } from '@/types/Analysis/AnalysisSets.types';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { HTSResultSummary, IDetailedHTSResult } from '../../../types/HTS.types';
import { IFilter, Sections } from '../../../types/Summary/Summary.types';
import HTSResultItem from '../../HTS/HTSResultItem';
import DataContentWrapper from '../SharedComponents/DataContentWrapper';
import Section from '../SharedComponents/Section';
import SummaryBox from '../SharedComponents/SummaryBox';

interface ISectionProps {
  summary?: ICurationSummary;
  label: string | JSX.Element;
  filter?: IFilter;
  submitChanges: (
    newSummary: string,
    section: Sections,
    date?: string
  ) => void;
}

export default function HTSSummary({
  summary,
  label,
  filter,
  submitChanges,
}: ISectionProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly } = useCuration();
  const { htsResults } = useSummaryData();
  const {
    htsBiosamples,
  } = useAnalysisSet();

  const [open, setOpen] = useState<boolean>(false);
  const [
    zScoreSummary,
    setZscoreSummary,
  ] = useState<Record<string, HTSResultSummary>>({});

  const canEdit = useIsUserAuthorised('curation.sample.hts.write', isAssignedCurator) && !isReadOnly;

  useEffect(() => {
    async function getHtsResultSummary(): Promise<void> {
      if (htsBiosamples) {
        const resp = await Promise.all(htsBiosamples.map((biosample) => (
          zeroDashSdk.hts.getZScoreSummary(biosample.biosampleId)
            .then((res) => ({ ...res, biosampleId: biosample.biosampleId }))
        )))
          .then((res) => res.reduce((acc, cur) => ({ [cur.biosampleId]: cur, ...acc }), {}));
        setZscoreSummary(resp);
      }
    }
    getHtsResultSummary();
  }, [htsBiosamples, zeroDashSdk.hts]);

  const row = (result: IDetailedHTSResult): ReactNode => htsResults && (
    <HTSResultItem
      data={result}
      zScoreSummary={zScoreSummary[result.biosampleId] ?? {}}
      key={`hts_data_${result.screenId}`}
    />
  );

  return (
    !filter ? (
      <Section
        label={label}
        open={open}
        setOpen={setOpen}
      >
        <DatePicker
          onChange={(date): void => (
            submitChanges(summary?.note || '', 'HTS', date?.format('YYYY-MM-DD'))
          )}
          value={dayjs(summary?.date || undefined)}
          label="HTS Curation Meeting Date"
          format="DD/MM/YYYY"
          sx={{ marginLeft: '48px' }}
          slotProps={{
            inputAdornment: {
              sx: {
                position: 'relative',
                top: '-4px',
              },
            },
          }}
          disabled={!canEdit}
        />
        <SummaryBox
          summary={summary?.note || ''}
          submitChanges={(newSummary): void => (
            submitChanges(newSummary, 'HTS', dayjs(summary?.date || undefined).format('YYYY-MM-DD'))
          )}
          title="HTS Curation Meeting Notes"
          placeholder="HTS Curation Meeting Notes"
          canEdit={canEdit}
        />
        {open && (
          <DataContentWrapper
            isLoading={htsResults === undefined}
            row={row}
            items={htsResults}
          />
        )}
      </Section>
    ) : (
      <div />
    )
  );
}
