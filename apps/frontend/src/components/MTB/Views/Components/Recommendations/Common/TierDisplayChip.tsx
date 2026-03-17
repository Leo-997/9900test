import { Chip } from '@mui/material';
import { CSSProperties, type JSX } from 'react';

interface IProps {
  tier: string | undefined;
  tierStyle?: 'light' | 'medium';
}

export default function TierDisplayChip({
  tier,
  tierStyle = 'light',
}: IProps): JSX.Element {
  const getTierContent = (): string => {
    if (tier === 'No tier') return tier;

    return `Tier ${tier || 'unspecified'}`;
  };

  const getTierStyle = (): CSSProperties => {
    if (!tier) {
      return {
        color: '#FF2969',
        backgroundColor: '#FEE0E9',
        border: '1px solid #FF2969',
      };
    }

    if (tierStyle === 'light') {
      return {
        color: '#022034',
        backgroundColor: '#F3F5F7',
        border: 'none',
      };
    }

    return {
      color: '#022034',
      backgroundColor: '#D0D9E2',
      border: 'none',
    };
  };

  return (
    <Chip
      label={getTierContent()}
      size="small"
      style={getTierStyle()}
    />
  );
}
