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
import { ISomaticSnv } from '../../../types/SNV.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getSomaticSnvSummary } from '../../../utils/misc/summaries';
import sortByGene from '../../Reports/Common/HelperFunctions/sortByGene';
import { SnvListItem } from '../../SNV/ListItem';
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
  label: string | JSX.Element;
  summary: string;
  submitChanges: (
    newSummary: string,
    section: Sections
  ) => void;
}

export default function SomaticSnvSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { snvs } = useSummaryData();
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample } = useAnalysisSet();
  const { isReadOnly } = useCuration();

  const [heliumSummary, setHeliumSummary] = useState<ISummary | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  useEffect(() => {
    if (!heliumSummary && tumourBiosample?.biosampleId) {
      zeroDashSdk.snv.somatic.getCuratedSampleSomaticSnvHeliumSummary(
        tumourBiosample.biosampleId,
      ).then((res) => {
        setHeliumSummary(res);
      });
    }
  }, [heliumSummary, tumourBiosample?.biosampleId, zeroDashSdk]);

  const row = (snv: ISomaticSnv): ReactNode => (
    <SnvListItem
      key={snv.variantId}
      snv={snv}
      summary={heliumSummary}
      joined
    />
  );

  return (
    <Section
      label={label}
      count={snvs?.length || 0}
      loading={snvs === undefined}
      setOpen={setOpen}
      open={open}
    >
      <TextList defaultText="No pathogenic or likely pathogenic snvs">
        {snvs
          ?.sort(sortByGene)
          ?.map((snv: ISomaticSnv) => (
            <CustomTypography key={getSomaticSnvSummary(snv)} variant="bodyRegular">{getSomaticSnvSummary(snv)}</CustomTypography>
          ))}
      </TextList>

      {(
        (canEdit)
        || summary.length !== 0
      ) && (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'SNV')}
          canEdit={canEdit}
        />
      )}

      <DataContentWrapper
        isLoading={false}
        className={open ? '' : classes.hide}
        row={row}
        items={snvs}
      />
    </Section>
  );
}
