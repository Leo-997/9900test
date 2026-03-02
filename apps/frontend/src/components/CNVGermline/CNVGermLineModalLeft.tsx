import { Grid } from '@mui/material';
import {
  createStyles, makeStyles,
} from '@mui/styles';
import { useMemo, useState, type JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { cnvCNTypeOptions, yesNoOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { CNVCNType, IGermlineCNV, IUpdateCNVBody } from '../../types/CNV.types';
import { ISummary, PathClass } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { toFixed } from '../../utils/math/toFixed';
import { PrismChip } from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { PathClassSelector } from '../PathClassSelector/PathClassSelector';
import ExpandedModalTitle from '../ExpandedModal/Components/ExpandedModalTitle';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import FrequencyChip from '../Chips/FrequencyChip';

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px',
  },
  avgCopy: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
  },
  wholeGeneIcon: {
    width: 24,
    height: 24,
    margin: '0px 0px 0px 4px',
  },
  section: {
    padding: 6,
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    height: 44,

    '&:hover': {
      background: '#F3F7FF',
    },
  },
  header: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  headerGeneList: {
    lineHeight: 1.5,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: 0,
  },
}));

type Props = {
  data: IGermlineCNV;
  handleUpdateData(
    body: IUpdateCNVBody,
    reports?: ReportType[]
  ): Promise<ReportType[]>;
  summary?: ISummary;
};

export default function CNVGermLineModal({
  data,
  handleUpdateData,
  summary,
}: Props): JSX.Element {
  const {
    pathclass,
    chromosome,
    cytoband,
    minCN,
    maxCN,
    averageCN,
    prism,
    cnType: initialCnType,
    platform,
  } = data;
  const classes = useStyles({ pathclass });
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: data?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(data.researchCandidate),
  );
  const [cnType, setCnType] = useState(initialCnType);

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const getSeenInRows = useMemo(() => (
    page?: number,
    limit?: number,
  ) => zeroDashSdk.cnv.germline.getSeenInByGeneId(
    data.biosampleId,
    data.geneId,
    page,
    limit,
  ), [data.biosampleId, data.geneId, zeroDashSdk.cnv.germline]);

  const handleResearchCandidateChange = (
    value: string,
  ): void => {
    setResearchCandidate(value);
    handleUpdateData({
      researchCandidate: strToBool(value),
    });
  };

  const handleUpdateCNType = (value: CNVCNType): void => {
    setCnType(value);
    handleUpdateData({
      cnType: value,
    });
  };

  const icon = (
    <ConsequencePathclassIcon
      pathclass={data.pathclass}
      height={54}
      width={54}
    />
  );

  const modalTitle = (
    <ExpandedModalTitle
      title="Gene"
      titleContent={data.gene}
      icon={icon}
    />
  );

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        style={{ marginBottom: 6 }}
        className={classes.section}
      >
        <Grid size={{ xs: 11, sm: 8, lg: 6 }} className={classes.panel}>
          <DataPanel
            label="CLASS"
            value={(
              <PathClassSelector
                biosampleId={data.biosampleId}
                currentPathClass={pathclass}
                updatePathClass={(pc: PathClass): void => {
                  handleUpdateData({ pathclass: pc });
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 11, lg: 4 }} className={classes.panel}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                overrideReadonlyMode={isReadOnly || !canEditAllCurators}
                value={researchCandidate}
                onChange={(e): void => handleResearchCandidateChange(e.target.value as string)}
                defaultValue={boolToStr(data.researchCandidate)}
              />
              )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="GENE"
            value={data.gene}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="CHROMOSOME"
            value={chromosome}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="CYTOBAND"
            value={cytoband}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 4, lg: 4 }} className={classes.panel}>
          <DataPanel
            label="COPY NUMBER"
            value={summary?.min !== undefined
              && summary?.max !== undefined
              && averageCN !== undefined && (
                <ScoreChip
                  min={0}
                  max={10}
                  mid={2}
                  value={Number(toFixed(averageCN, 2))}
                  label={data.minCN === data.maxCN
                    ? `${toFixed(averageCN, 2)}`
                    : `${toFixed(data.minCN, 2)} - ${toFixed(data.maxCN, 2)}`}
                />
            )}
          />
        </Grid>
        <Grid size={{ xs: 4, lg: 4 }} className={classes.panel}>
          <DataPanel
            label="CN TYPE"
            value={summary?.min !== undefined
              && summary?.max !== undefined
              && averageCN !== undefined && (
                <AutoWidthSelect
                  options={cnvCNTypeOptions}
                  value={cnType}
                  onChange={(e): void => handleUpdateCNType(e.target.value as CNVCNType)}
                  overrideReadonlyMode={isReadOnly || !canEditAssigned}
                />
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="MINIMUM CN"
            value={toFixed(minCN, 2) === '0.00' ? 0 : toFixed(minCN, 2)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="MAXIMUM CN"
            value={toFixed(maxCN, 2) === '0.00' ? 0 : toFixed(maxCN, 2)}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Gene List"
            value={(
              <PrismChip label={prism || 'N/A'} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="PLATFORM"
            value={platform}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        spacing={2}
        py={1}
      >
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="Frequency"
            value={(
              <FrequencyChip
                tabName="germline_cnv"
                label="Germline"
                counts={data.counts || []}
                getRows={(page, limit) => getSeenInRows(page, limit)}
                modalTitle={modalTitle}
              />
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
    </>
  );
}
