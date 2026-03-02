import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, useState, type JSX } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../contexts/CurationContext';
import { useSummaryData } from '../../../contexts/SummaryDataContext';
import { IParsedCytogeneticsData } from '../../../types/Cytogenetics.types';
import { Sections } from '../../../types/Summary/Summary.types';
import { getCytobandSummary } from '../../../utils/misc/summaries';
import CustomTypography from '../../Common/Typography';
import CytogeneticsPanel from '../../Cytogenetics/CytogeneticsPanel';
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
  biosampleId: string | undefined;
}

export default function CytogeneticsSummary({
  summary,
  label,
  submitChanges,
  biosampleId,
}: ISectionProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { isReadOnly } = useCuration();
  const {
    armCnvs,
    reportableCytobands,
    targetableCytobands,
    armCnSummary,
  } = useSummaryData();

  const [open, setOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write');

  const row = (armCnv: IParsedCytogeneticsData): ReactNode => (
    open && armCnvs && (
      <CytogeneticsPanel
        key={`somatic-cytogenetics-${armCnv.chr}-${armCnv.cytoband}`}
        data={armCnv}
        biosampleId={biosampleId}
        type="somatic"
        updateCytogenetics={zeroDashSdk.cytogenetics.somatic.updateCytogenetics}
        getCytobands={zeroDashSdk.cytogenetics.somatic.getCytobands}
        reportableCytobands={
          reportableCytobands?.filter((cyto) => cyto.chr === armCnv.chr)
        }
        targetableCytobands={
          targetableCytobands?.filter((cyto) => cyto.chr === armCnv.chr)
        }
        view="summary"
        armCnSummary={armCnSummary}
      />
    )
  );

  return (
    <Section
      label={label}
      count={(armCnvs?.length || 0) + (reportableCytobands?.length || 0)}
      loading={armCnvs === undefined}
      open={open}
      setOpen={setOpen}
    >
      <TextList defaultText="No arm level changes to report">
        {armCnvs?.map(
          (cyto: IParsedCytogeneticsData) => {
            const summaryStrings = getCytobandSummary(
              cyto,
              reportableCytobands?.filter((c) => c.chr === cyto.chr) || [],
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
          },
        )}
      </TextList>

      {(!canEdit || isReadOnly) && summary.length === 0 ? (
        ''
      ) : (
        <SummaryBox
          className={open || summary.length ? '' : classes.hide}
          summary={summary}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'CYTOGENETICS')}
          canEdit={canEdit && !isReadOnly}
        />
      )}
      <DataContentWrapper
        isLoading={armCnvs === undefined}
        className={open ? '' : classes.hide}
        row={row}
        items={armCnvs}
      />
    </Section>
  );
}
