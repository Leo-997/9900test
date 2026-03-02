import { makeStyles } from '@mui/styles';
import { ReactNode, useState, type JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { IMethylationData, IMethylationGeneData } from '../../../types/Methylation.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getMethylationSummary } from '../../../utils/misc/summaries';
import MethylationGenePanel from '../../Methylation/MethylationGenePanel';
import MethylationPanel from '../../Methylation/MethylationPanel';
import DataContentWrapper from '../SharedComponents/DataContentWrapper';
import Section from '../SharedComponents/Section';
import SummaryBox from '../SharedComponents/SummaryBox';
import TextList from '../SharedComponents/TextList';

const useStyles = makeStyles(() => ({
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

export default function MethylationSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { isReadOnly } = useCuration();
  const {
    classifiers,
    methGenes,
  } = useSummaryData();

  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write');

  const isMgmtReportable = methGenes ? methGenes.some((mg) => mg.gene.toUpperCase() === 'MGMT' && mg.reportable) : false;

  const filteredMethGenes = isMgmtReportable
    ? methGenes
    : methGenes?.filter((mg) => mg.gene.toUpperCase() !== 'MGMT');

  // Calculate "length" of methylation (No. reportable)
  const methLength = (
    m: {
      meth: IMethylationData[] | undefined,
      genes: IMethylationGeneData[] | undefined,
    },
  ): number => (
    Number(m?.meth?.length) + Number(m?.genes?.length)
  );

  const totalCount = methLength({
    meth: classifiers,
    genes: filteredMethGenes,
  });

  const summaryStrings = getMethylationSummary({
    meth: classifiers,
    genes: methGenes,
  });

  const isMethGene = (
    item: IMethylationData | IMethylationGeneData,
  ): item is IMethylationGeneData => (
    'gene' in item
  );

  const row = (item: IMethylationData | IMethylationGeneData): ReactNode => {
    if (!classifiers || !methGenes) return <div />;

    if (isMethGene(item)) {
      return (
        <MethylationGenePanel
          data={item}
          joined
        />
      );
    }
    return <MethylationPanel data={item} />;
  };

  return (
    <Section
      label={label}
      count={totalCount}
      loading={classifiers === undefined || methGenes === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList defaultText="Not performed">
        {summaryStrings.map((s) => (
          <CustomTypography key={s} variant="bodyRegular">
            {s}
          </CustomTypography>
        ))}
      </TextList>
      {(!canEdit || isReadOnly) && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'METHYLATION')}
          canEdit={canEdit && !isReadOnly}
        />
      )}
      <DataContentWrapper
        isLoading={classifiers === undefined || methGenes === undefined}
        className={open ? '' : classes.hide}
        row={row}
        items={[
          ...(classifiers || []),
          ...(methGenes || []),
        ]}
      />
    </Section>
  );
}
