import { makeStyles } from '@mui/styles';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import CustomTypography from '@/components/Common/Typography';
import SVListItem from '@/components/SomaticSV/SVListItem';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { Sections } from '../../../types/Summary/Summary.types';
import { ISomaticSV, SVSummary } from '../../../types/SV.types';
import { getFusionSummary } from '../../../utils/misc/summaries';
import sortByGene from '../../Reports/Common/HelperFunctions/sortByGene';
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

export default function SomaticSvSummary({
  label,
  summary,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { svs } = useSummaryData();
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample } = useAnalysisSet();
  const { isReadOnly } = useCuration();

  const [heliumSummary, setHeliumSummary] = useState<SVSummary | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  useEffect(() => {
    if (!heliumSummary && tumourBiosample?.biosampleId) {
      zeroDashSdk.sv.somatic.getSVSummary(
        tumourBiosample?.biosampleId,
      ).then((res) => {
        setHeliumSummary(res);
      });
    }
  }, [heliumSummary, zeroDashSdk, tumourBiosample?.biosampleId]);

  const row = (sv: ISomaticSV): ReactNode => svs && (
    <SVListItem
      key={sv.variantId}
      sv={sv}
      minScore={heliumSummary?.minScore || 0}
      maxScore={heliumSummary?.maxScore || 0}
      joined
    />
  );

  return (
    <Section
      label={label}
      count={svs?.length}
      loading={svs === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList defaultText="No clinically relevant gene fusions">
        {svs
          ?.sort((a, b) => {
            const startGeneDiff = sortByGene(a.startGene, b.startGene);
            const endGeneDiff = sortByGene(a.endGene, b.endGene);

            if (startGeneDiff === 0) return endGeneDiff;
            return startGeneDiff;
          })
          ?.map((sv: ISomaticSV) => (
            <CustomTypography key={getFusionSummary(sv)} variant="bodyRegular">{getFusionSummary(sv)}</CustomTypography>
          ))}
      </TextList>

      {!canEdit && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'SV')}
          canEdit={canEdit}
        />
      )}

      <DataContentWrapper
        isLoading={svs === undefined || svs === undefined}
        className={open ? '' : classes.hide}
        row={row}
        items={svs}
      />
    </Section>
  );
}
