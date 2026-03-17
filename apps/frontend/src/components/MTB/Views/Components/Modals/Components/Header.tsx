import CustomTypography from '@/components/Common/Typography';
import { TierType } from '@/types/MTB/Recommendation.types';
import {
  Box,
} from '@mui/material';
import { Dispatch, ReactNode, SetStateAction, type JSX } from 'react';
import TierSelectionChip from '../../Recommendations/Common/TierSelectionChip';

interface IProps {
  title: ReactNode;
  tier?: TierType;
  setTier?: Dispatch<SetStateAction<TierType>> | ((newTier: TierType) => void);
}

export default function Header({
  title,
  tier,
  setTier,
}: IProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      width="100%"
      padding="24px 40px"
    >
      <Box width="50%" paddingRight="40px">
        {typeof title === 'string' ? (
          <CustomTypography variant="h2" fontWeight="medium">
            {title}
          </CustomTypography>
        ) : title}
      </Box>
      <Box width="50%">
        {tier && setTier && (
          <TierSelectionChip
            label="Therapy Tier"
            updateTier={setTier}
            tier={tier}
          />
        )}
      </Box>

    </Box>
  );
}
