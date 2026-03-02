import { Box, Grid } from '@mui/material';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import CustomTypography from '@/components/Common/Typography';
import { boolToStr } from '@/utils/functions/bools';
import { makeStyles } from '@mui/styles';
import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  item: {
    minHeight: '32px',
    paddingLeft: '8px',
    borderLeft: '1px solid #596983',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gridGap: '10px',
  },
  chip: {
    height: '28px',
    backgroundColor: '#ECF0F3',
  },
  title: {
    color: '#273957',
  },
}));

interface IDrugDetailGridProps {
  drug: IExternalDrug,
}

export function DrugDetailGrid({
  drug,
}: IDrugDetailGridProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container spacing={2} style={{ padding: '12px 16px' }}>
      <Grid container size={8} spacing={2}>
        <Grid size={8}>
          <CustomTypography variant="label" className={classes.title}>
            Company
          </CustomTypography>
          <CustomTypography variant="bodyRegular" fontWeight="medium" className={classes.item}>
            {drug.company ?? '-'}
          </CustomTypography>
        </Grid>
        <Grid size={4}>
          <CustomTypography variant="label" className={classes.title}>
            Paediatric Dose
          </CustomTypography>
          <CustomTypography variant="bodyRegular" fontWeight="medium" className={classes.item}>
            {boolToStr(drug.hasPaediatricDose) || '-'}
          </CustomTypography>
        </Grid>
      </Grid>
      <Grid size={12}>
        <CustomTypography variant="label" className={classes.title}>
          Drug Classes
        </CustomTypography>
        <Box className={classes.item}>
          {drug.classes.length > 0 ? (
            drug.classes.map((c) => (
              <CustomChip
                pill
                size="small"
                label={c.name}
                backgroundColour={corePalette.green10}
                colour={corePalette.green200}
              />
            ))
          ) : (
            '-'
          )}
        </Box>
      </Grid>
      <Grid size={12}>
        <CustomTypography variant="label" className={classes.title}>
          Targets
        </CustomTypography>
        <Box className={classes.item}>
          {drug.targets.length > 0 ? (
            drug.targets.map((t) => (
              <CustomChip
                pill
                size="small"
                label={t.name}
                backgroundColour={corePalette.green10}
                colour={corePalette.green200}
              />
            ))
          ) : (
            '-'
          )}
        </Box>
      </Grid>
      <Grid size={12}>
        <CustomTypography variant="label" className={classes.title}>
          Pathways
        </CustomTypography>
        <Box className={classes.item}>
          {drug.pathways.length > 0 ? (
            drug.pathways.map((p) => (
              <CustomChip
                pill
                size="small"
                label={p.name}
                backgroundColour={corePalette.green10}
                colour={corePalette.green200}
              />
            ))
          ) : (
            '-'
          )}
        </Box>
      </Grid>
      <Grid container size={8} spacing={2}>
        <Grid size={4}>
          <CustomTypography variant="label" className={classes.title}>
            FDA Approved
          </CustomTypography>
          <CustomTypography variant="bodyRegular" fontWeight="medium" className={classes.item}>
            {boolToStr(drug.fdaApproved) || '-'}
          </CustomTypography>
        </Grid>
        <Grid size={4}>
          <CustomTypography variant="label" className={classes.title}>
            ARTG Approval
          </CustomTypography>
          <CustomTypography variant="bodyRegular" fontWeight="medium" className={classes.item}>
            {boolToStr(drug.artgApproved) || '-'}
          </CustomTypography>
        </Grid>
        <Grid size={4}>
          <CustomTypography variant="label" className={classes.title}>
            TGA Approval
          </CustomTypography>
          <CustomTypography variant="bodyRegular" fontWeight="medium" className={classes.item}>
            {boolToStr(drug.tgaApproved) || '-'}
          </CustomTypography>
        </Grid>
      </Grid>
    </Grid>
  );
}
