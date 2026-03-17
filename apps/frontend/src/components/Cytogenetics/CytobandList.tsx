import { ReportType } from '@/types/Reports/Reports.types';
import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { Chromosome } from '../../types/Common.types';
import { Arm, ISampleCytoband } from '../../types/Cytogenetics.types';
import CustomTypography from '../Common/Typography';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import { CytobandListItem } from './CytobandListItem';

const useStyles = makeStyles(() => ({
  headingsWrapper: {
    padding: '5px 12px 0px 0px',
  },
  rows: {
    columnGap: '8px',
  },
  cytobandItems: {
    width: '100%',
    padding: '5px 12px',
    borderTop: '1px solid #D0D9E2',
  },
  title: {
    width: '100px',
    flexShrink: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& span': {
      display: 'inline-block',
    },
  },
  copyNumberTitle: {
    width: '165px !important',
    flexShrink: 0,
  },
  sticky: {
    position: 'sticky',
    left: '0px',
    backgroundColor: 'white',
    gap: '8px',
    zIndex: 1,
    width: '150px !important',
    flexShrink: 0,
  },
  stickyCytoband: {
    flexShrink: 0,
    minWidth: '150px',
  },
  iconPlaceholder: {
    display: 'inline-block',
    width: '40px',
  },
}));

interface ICytobandListProps {
  biosampleId: string | undefined;
  type: 'somatic' | 'germline';
  chromosome: Chromosome;
  cytobands: ISampleCytoband[];
  setCytobands: Dispatch<SetStateAction<ISampleCytoband[] | undefined>>;
  handleOpenModal(arm: Arm, cyto: ISampleCytoband, reports: ReportType[]): void;
}

export function CytobandList({
  biosampleId,
  type,
  chromosome,
  cytobands,
  setCytobands,
  handleOpenModal,
}: ICytobandListProps): JSX.Element {
  const classes = useStyles();

  return (
    <ScrollableSection style={{ width: '100%' }}>
      <Box width="fit-content">
        <Grid
          container
          className={classes.headingsWrapper}
        >
          <Grid container direction="row" columnGap="8px" alignItems="center" wrap="nowrap" className={classes.rows}>
            <Grid
              container
              size={3}
              wrap="nowrap"
              className={clsx(classes.title, classes.sticky)}
            >
              <Grid>
                <span className={classes.iconPlaceholder} />
              </Grid>
              <Grid
                className={classes.stickyCytoband}
              >
                <CustomTypography
                  truncate
                  variant="label"
                >
                  Cytoband
                </CustomTypography>
              </Grid>
            </Grid>
            <Grid size={2} className={clsx(classes.title, classes.copyNumberTitle)}>
              <CustomTypography
                truncate
                variant="label"
              >
                CN (computed)
              </CustomTypography>
            </Grid>
            <Grid
              size={3}
              className={classes.title}
              style={{ width: '125px', maxWidth: '125px' }}
            >
              <CustomTypography
                truncate
                variant="label"
              >
                CN Type
              </CustomTypography>
            </Grid>
            <Grid
              size={3}
              className={classes.title}
              style={{ width: '125px', maxWidth: '125px' }}
            >
              <CustomTypography
                truncate
                variant="label"
              >
                Classification
              </CustomTypography>
            </Grid>
            <Grid className={classes.title}>
              <CustomTypography
                truncate
                variant="label"
              >
                Reportable
              </CustomTypography>
            </Grid>
            <Grid className={classes.title}>
              <CustomTypography
                truncate
                variant="label"
              >
                In reports
              </CustomTypography>
            </Grid>
            <Grid className={classes.title}>
              <CustomTypography
                truncate
                variant="label"
              >
                Targetable
              </CustomTypography>
            </Grid>
          </Grid>
        </Grid>
        { cytobands.map((cyto) => (
          <CytobandListItem
            key={cyto.cytoband}
            biosampleId={biosampleId}
            type={type}
            cytoband={cyto}
            cytobands={cytobands}
            chromosome={chromosome}
            setCytobands={setCytobands}
            handleOpenModal={handleOpenModal}
          />
        ))}
      </Box>
    </ScrollableSection>
  );
}
