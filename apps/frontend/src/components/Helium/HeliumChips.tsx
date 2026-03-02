import { Grid } from '@mui/material';

import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';

import { ISummary } from '../../types/Common.types';
import { Helium } from '../../types/Helium.types';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  title: {
    textTransform: 'uppercase',
    fontSize: '11px',
    color: '#AEB9C5',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '1.5px',
  },
  section: {
    padding: 6,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 8,
  },
  parent: {
    backgroundColor: '#FFFFFF',
  },
  divider: {
    margin: '29px 0 29px 0',
    borderTop: '1px dashed #263238',
    width: '100%',
    opacity: 0.24,
  },
  text: {
    paddingTop: '8px',
  },
  chipCol: {
    paddingRight: '29px',
  },
  reasonCol: {
    marginTop: 8,
    marginBottom: 8,
    height: 28,
    verticalAlign: 'middle',
  },
  versionChip: {
    height: 20,
    marginLeft: 10,
    color: '#1E86FC',
    backgroundColor: '#F3F7FF',
  },
  versionChipLabel: {
    paddingLeft: 4,
    paddingRight: 6,
  },
}));

export interface IHeliumChipsData {
  helium?: Helium;
  heliumScore?: number
  summary: ISummary;
  breakdown?: string;
  divider?: JSX.Element;
}

function HeliumChips({
  helium, heliumScore = 0, summary, divider, breakdown,
}: IHeliumChipsData): JSX.Element {
  const classes = useStyles();
  const score = helium ? helium.reduce((a, b) => a + b.contribution, 0) : heliumScore;

  return (
    <>
      {divider || <hr />}
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={4}>
          <DataPanel
            label="Helium Score"
            value={(
              <ScoreChip
                min={summary.min}
                mid={summary.min}
                max={summary.max}
                value={score}
                isLOH={false}
              />
            )}
          />
        </Grid>
        <Grid size={8}>
          <DataPanel
            label="Breakdown"
            value={(
              <CustomTypography
                variant="bodyRegular"
                truncate
                style={{ width: '100%' }}
              >
                {breakdown}
              </CustomTypography>
            )}
          />
        </Grid>
      </Grid>
      {divider || <hr />}
    </>
  );
}

export { HeliumChips };
