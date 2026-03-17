import { Box } from '@mui/material';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import AlterationChip from '../../../../../Chips/AlterationChip';
import TierDisplayChip from './TierDisplayChip';
import StatusChip from '../../../../../Chips/StatusChip';

import type { JSX } from "react";

export interface ITherapyRecommendationHeaderProps {
  targets?: IMolecularAlterationDetail[];
  tier?: string;
  tierStyle?: 'light' | 'medium';
  showTier?: boolean;
  reportOnly?: boolean;
}

export function RecommendationHeader({
  targets,
  tier,
  tierStyle = 'light',
  showTier = false,
  reportOnly = false,
}: ITherapyRecommendationHeaderProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      gap="10px"
      marginRight="auto"
      flexWrap="wrap"
    >
      {reportOnly && (
        <StatusChip
          status="In report only"
          backgroundColor="#D2CCFF"
          color="#362A93"
          tooltipText="This recommendation was created for the report and does not exist on any slides"
        />
      )}
      {showTier && (
        <TierDisplayChip tier={tier} tierStyle={tierStyle} />
      )}
      {targets?.map((t) => (
        <AlterationChip
          alteration={t}
          mutationType={t.mutationType}
        />
      ))}
    </Box>
  );
}
