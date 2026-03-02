import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import {
  JSX,
  useEffect, useMemo, useRef, useState,
} from 'react';
import { getCitationId } from '@/utils/functions/pubmed/getCitationId';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { errorFetchingDataMsg } from '@/constants/Reports/reports';
import useEvidences from '../../../../../api/useEvidences';
import { ICitation } from '../../../../../types/Evidence/Citations.types';
import { isCitation } from '../../../../../types/Evidence/Evidences.types';
import CustomTypography from '../../../../Common/Typography';
import { ErrorMessageBox } from '../Components/ErrorMessageBox';

const useStyles = makeStyles(() => ({
  title: {
    marginBottom: '8px',
  },
  row: {

    '& *': {
      fontSize: '13px !important',
    },
  },
}));

export function References(): JSX.Element {
  const classes = useStyles();
  const { getEvidenceById } = useEvidences();
  const {
    reportEvidenceLinks,
    recommendationEvidenceLinks,
    clinicalCommentEvidenceLinks,
    curationCommentEvidenceLinks,
    errorLoadingItems,
  } = useReportData();
  const { isApproving } = useReport();

  const [citations, setCitations] = useState<ICitation[]>([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const evidenceLinks = useMemo(() => [
    ...reportEvidenceLinks,
    ...recommendationEvidenceLinks,
    ...clinicalCommentEvidenceLinks,
    ...curationCommentEvidenceLinks,
  ], [
    clinicalCommentEvidenceLinks,
    curationCommentEvidenceLinks,
    recommendationEvidenceLinks,
    reportEvidenceLinks,
  ]);

  useEffect(() => {
    // get the evidence from variant comments
    if (evidenceLinks?.length) {
      Promise.all(evidenceLinks.map((evidence) => (
        getEvidenceById(evidence.externalId)
          .then((resp) => resp)
      )))
        .then((allEvidence) => {
          const newCitations = allEvidence.filter((e) => e && isCitation(e)) as ICitation[];
          setCitations(
            // Removes evidence duplicates
            // e.g. one citation referenced more than once on different parts of the report
            // would wrongly show multiple times in the References sections
            newCitations
              .filter((citation, index, self) => (
                self.findIndex(
                  (c) => c.id === citation.id
                || (c.externalId && citation.externalId && c.externalId === citation.externalId),
                ) === index
              )),
          );
        });
    }
  }, [evidenceLinks, getEvidenceById]);

  const showErrorMsg = errorLoadingItems.some((e) => ['reportEvidenceLinks', 'recEvidenceLinks'].includes(e));

  useEffect(() => {
    if (wrapperRef.current && showErrorMsg && isApproving === 'Finalise') {
      wrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isApproving, showErrorMsg]);

  const getAuthors = (authors: string): string => {
    const authorsArr = authors.split(',').map((a) => a.trim().replace(/\.$/, ''));
    const authorsStr = `${authorsArr.filter((a, i) => i < 3).join(', ')}${authorsArr.length > 3 ? ', et al' : ''}`;
    return authorsStr.includes('et al')
      ? authorsStr
      : authorsStr.replace(/,([^,]*)$/, ' and $1');
  };

  const sortReferences = (a: ICitation, b: ICitation): number => (
    getAuthors(a.authors || '').toLowerCase().localeCompare(getAuthors(b.authors || '').toLowerCase())
  );

  return citations?.length ? (
    <Grid
      ref={wrapperRef}
      container
      direction="row"
      wrap="nowrap"
    >
      <Grid container direction="column">
        <Grid container direction="row" className={classes.title}>
          <Grid size={12}>
            <CustomTypography variant="bodyRegular" fontWeight="bold">
              References
            </CustomTypography>
          </Grid>
        </Grid>
        <Grid container direction="column" style={{ rowGap: '8px' }}>
          {citations?.sort(sortReferences)?.map((citation) => (
            <Grid key={citation.id} container direction="row" className={clsx(classes.row, 'keep-together')}>
              <CustomTypography variant="bodySmall">
                {`${getAuthors(citation.authors || '')}. `}
                {`(${citation.year}). `}
                {`${citation.title.replace(/\.$/, '')}, `}
                {citation.publication}
                {getCitationId(citation.source, citation.externalId)}
                .
              </CustomTypography>
            </Grid>
          ))}
        </Grid>
        {showErrorMsg && <ErrorMessageBox message={errorFetchingDataMsg} />}
      </Grid>
    </Grid>
  ) : <div />;
}
