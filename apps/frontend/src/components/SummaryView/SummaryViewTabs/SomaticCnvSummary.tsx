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
import { ICNVSummary, ISomaticCNV } from '../../../types/CNV.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getCnvSummary } from '../../../utils/misc/summaries';
import CNVListItem from '../../CNV/CNVListItem';
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

export default function SomaticCnvSummary({
  summary,
  label,
  submitChanges,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const { cnvs } = useSummaryData();
  const zeroDashSdk = useZeroDashSdk();
  const { tumourBiosample, rnaBiosample } = useAnalysisSet();
  const { isReadOnly } = useCuration();

  const [heliumSummary, setHeliumSummary] = useState<ICNVSummary | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  useEffect(() => {
    if (!heliumSummary && tumourBiosample?.biosampleId) {
      zeroDashSdk.cnv.somatic.getCuratedSampleSomaticCnvSummary(
        tumourBiosample.biosampleId,
      ).then((data) => {
        setHeliumSummary(data);
      });
    }
  }, [heliumSummary, zeroDashSdk, tumourBiosample?.biosampleId]);

  const row = (cnv: ISomaticCNV): ReactNode => cnvs && (
    <CNVListItem
      summary={heliumSummary}
      data={cnv}
      key={`${cnv.geneId}-cnv`}
      joined
    />
  );

  return (
    <Section
      label={label}
      count={cnvs?.length}
      loading={cnvs === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList>
        {cnvs
          ?.sort(sortByGene)
          ?.map((cnv: ISomaticCNV) => (
            <CustomTypography key={getCnvSummary(cnv, Boolean(rnaBiosample?.biosampleId))} variant="bodyRegular">
              {getCnvSummary(cnv, Boolean(rnaBiosample?.biosampleId))}
            </CustomTypography>
          ))}
      </TextList>

      {!canEdit && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'CNV')}
          canEdit={canEdit}
        />
      )}

      <DataContentWrapper
        isLoading={cnvs === undefined || cnvs === undefined}
        className={open ? '' : classes.hide}
        row={row}
        items={cnvs}
      />
    </Section>
  );
}
