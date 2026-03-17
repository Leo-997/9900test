import { Grid } from '@mui/material';
import { createStyles, CSSProperties, makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { cnvCNTypeOptions, yesNoOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import {
  CNVCNType, ICNVSummary, ISomaticCNV, IUpdateCNVBody,
} from '../../types/CNV.types';
import { PathClass } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { toFixed } from '../../utils/math/toFixed';
import {
  PrismChip,
} from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import { HeliumChips } from '../Helium/HeliumChips';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { PathClassSelector } from '../PathClassSelector/PathClassSelector';

interface IStyleProps {
  pathclass: PathClass;
}

const useStyles = makeStyles(() => createStyles({
  section: {
    padding: 6,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  selectButton: ({ pathclass }: IStyleProps) => {
    let customStyles: CSSProperties;
    if (
      pathclass === 'C5: Pathogenic'
        || pathclass === 'C4: Likely Pathogenic'
    ) {
      customStyles = {
        backgroundColor: '#FEF1F6',
        color: '#DD0951',
      };
    } else if (
      pathclass === 'C3.8: VOUS'
        || pathclass === 'C3: VOUS'
    ) {
      customStyles = {
        backgroundColor: '#E0FFEF',
        color: '#048057',
      };
    } else {
      customStyles = {
        backgroundColor: '#D0D9E2',
        color: '#022034',
      };
    }

    return {
      height: 40,
      width: 210,
      borderRadius: 4,
      ...customStyles,
    };
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
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: 0,
  },
}));

interface IProps {
  cnv: ISomaticCNV;
  handleUpdateData(
    body: IUpdateCNVBody,
    reports?: ReportType[]
  ): Promise<ReportType[]>;
  summary?: ICNVSummary;
}

export default function CNVModalLeft({
  cnv,
  handleUpdateData,
  summary,
}: IProps): JSX.Element {
  const {
    cnType: initialCnType,
  } = cnv;

  const classes = useStyles({ pathclass: cnv.pathclass });
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: cnv?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(cnv.researchCandidate),
  );
  const [cnType, setCnType] = useState(initialCnType);

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleResearchCandidateChange = (
    value: string,
  ): void => {
    setResearchCandidate(value);
    handleUpdateData({
      researchCandidate: strToBool(value),
    });
  };

  const handleUpdateCNType = async (value: CNVCNType): Promise<void> => {
    setCnType(value);
    handleUpdateData({
      cnType: value,
    });
  };

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        style={{ marginBottom: 6 }}
        spacing={2}
        className={classes.section}
      >
        <Grid size={{ xs: 11, lg: 8 }} className={classes.panel}>
          <DataPanel
            label="CLASS"
            value={(
              <PathClassSelector
                biosampleId={cnv.biosampleId}
                currentPathClass={cnv.pathclass}
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
                overrideReadonlyMode={
                  isReadOnly || !canEditAllCurators
                }
                value={researchCandidate}
                onChange={(e): void => handleResearchCandidateChange(e.target.value as string)}
                defaultValue={boolToStr(cnv.researchCandidate)}
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
            label="Gene"
            value={cnv.gene}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="CHROMOSOME"
            value={cnv.chromosome}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="CYTOBAND"
            value={cnv.cytoband}
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
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Copy Number"
            value={summary?.copyNumber.min !== undefined
              && summary?.copyNumber.max !== undefined
              && cnv.averageCN !== undefined && (
                <ScoreChip
                  min={0}
                  max={10}
                  mid={2}
                  value={Number(toFixed(cnv.averageCN, 2))}
                  label={cnv.minCn === cnv.maxCn
                    ? `${toFixed(cnv.averageCN, 2)}`
                    : `${toFixed(cnv.minCn, 2)} - ${toFixed(cnv.maxCn, 2)}`}
                />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="CN Type"
            value={(
              <AutoWidthSelect
                options={cnvCNTypeOptions}
                value={cnType}
                onChange={(e): Promise<void> => handleUpdateCNType(e.target.value as CNVCNType)}
                sx={{
                  maxWidth: '90%',
                }}
                overrideReadonlyMode={
                  isReadOnly || !canEditAssigned
                }
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="RNA Z-SCORE"
            value={summary?.zScore.max && summary?.zScore.min && cnv.rnaZScore && (
              <ScoreChip
                min={Number(toFixed(summary.zScore.min, 2))}
                max={Number(toFixed(summary.zScore.max, 2))}
                mid={0}
                value={Number(toFixed(cnv.rnaZScore, 2))}
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
            label="MINIMUM CN"
            value={toFixed(cnv.minCn, 2) === '0.00' ? 0 : toFixed(cnv.minCn, 2)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="MAXIMUM CN"
            value={toFixed(cnv.maxCn, 2) === '0.00' ? 0 : toFixed(cnv.maxCn, 2)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="LOH"
            value={
              cnv.minMinorAlleleCn !== null
                && cnv.minMinorAlleleCn < 0.5
                && !['X', 'Y'].includes(cnv.chromosome.replace('chr', '').toUpperCase())
                ? 'Yes'
                : 'No'
            }
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
            label="RNA TPM"
            value={!cnv.rnaTpm || toFixed(cnv.rnaTpm, 2) === '0.00' ? 0 : toFixed(cnv.rnaTpm, 2)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="RNA MEDIAN TPM"
            value={!cnv.rnaMedianTpm || toFixed(cnv.rnaMedianTpm, 2) === '0.00' ? 0 : toFixed(cnv.rnaMedianTpm, 2)}
          />
        </Grid>
      </Grid>
      <HeliumChips
        heliumScore={cnv.heliumScore ?? 0}
        summary={{ min: 0, max: 1, mid: 0 }}
        breakdown={cnv.heliumBreakdown}
        divider={<hr className={classes.hairline} />}
      />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Gene List"
            value={<PrismChip label={cnv.prism || 'N/A'} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }} className={classes.panel}>
          <DataPanel
            label="PLATFORM"
            value={cnv.platform}
          />
        </Grid>
      </Grid>
    </>
  );
}
