import { styled } from '@mui/material';
import { variantTypes } from '@/constants/Common/variants';
import { IMolecularAlterationDetail } from '../../types/MTB/MolecularAlteration.types';
import { getColourByMutationType } from '../../utils/functions/getColourByMutationType';
import { getGeneOrNonGene } from '../../utils/functions/getGeneOrNonGeneBasedAlteration';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

interface IProps {
  data: IMolecularAlterationDetail;
}

const Chip = styled(CustomChip)<IProps>(({ data, theme }) => ({
  height: '36px',
  backgroundColor: theme.colours.core.grey10,
  border: `1px solid ${getColourByMutationType(data.mutationType)}`,
  borderRadius: '8px',
  marginRight: '8px',
  marginTop: '8px',
  padding: '6px',
  maxWidth: 'calc(100% - 100px)',
}));

const Icon = styled('div')<IProps>(({ data }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: getColourByMutationType(data.mutationType),
}));

export default function SlideMolecularAlterationChip({
  data,
}: IProps): JSX.Element {
  return (
    <Chip
      data={data}
      label={(
        <CustomTypography variant="bodySmall" truncate>
          {getGeneOrNonGene(data)}
        </CustomTypography>
      )}
      icon={variantTypes.includes(data.mutationType) ? (
        <Icon data={data} />
      ) : (
        <div />
      )}
    />
  );
}
