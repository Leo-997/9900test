import React, { type JSX } from 'react';
import { Box, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../../../../Common/Typography';
import mapMutationType from '../../../../../utils/functions/mapMutationType';
import { VariantType } from '../../../../../types/misc.types';

const useStyles = makeStyles(() => ({
  chip: {
    marginRight: '8px',
    padding: '2px',
    marginBottom: '8px',
  },
}));

interface IActiveSlideProps {
  gene: string;
  mutationType: VariantType;
}

export default function GeneChip({
  gene,
  mutationType,
}: IActiveSlideProps): JSX.Element {
  const classes = useStyles();

  return (
    <Chip
      variant="outlined"
      label={(
        <Box display="flex " flexDirection="row" justifyContent="flex-start">
          <CustomTypography variant="bodySmall" fontWeight="bold">
            {gene}
          </CustomTypography>
          <CustomTypography variant="bodySmall" color="textSecondary" style={{ paddingLeft: '5px' }}>
            {mapMutationType(mutationType)}
          </CustomTypography>
        </Box>
      )}
      size="small"
      className={classes.chip}
    />
  );
}
