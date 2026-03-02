import { Chip, Box } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { VariantType } from '../../types/misc.types';
import mapMutationType from '../../utils/functions/mapMutationType';
import CustomTypography from '../Common/Typography';
import { getGeneOrNonGene } from '../../utils/functions/getGeneOrNonGeneBasedAlteration';
import { IMolecularAlterationDetail } from '../../types/MTB/MolecularAlteration.types';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FFFFFF',
  },
}));

interface IProps {
  alteration?: IMolecularAlterationDetail;
  mutationType?: VariantType;
  className?: string;
}

export default function AlterationChip({
  alteration,
  mutationType,
  className,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Chip
      variant="outlined"
      className={clsx(classes.root, className)}
      label={(
        <Box
          display="flex "
          flexDirection="row"
          justifyContent="flex-start"
        >
          <CustomTypography variant="bodySmall" fontWeight="bold">
            {alteration ? getGeneOrNonGene(alteration) : '-'}
          </CustomTypography>
          <CustomTypography variant="bodySmall" color="textSecondary" style={{ marginLeft: '5px' }}>
            {mapMutationType(mutationType)}
          </CustomTypography>
        </Box>
      )}
      size="small"
    />
  );
}
