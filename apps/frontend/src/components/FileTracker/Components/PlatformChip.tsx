import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';

import type { JSX } from "react";

interface IProps {
  platform: 'netapp' | 'dnanexus' | 'ncimdss' | 'cavatica';
}

export default function PlatformChip({
  platform,
}: IProps): JSX.Element {
  const chipColours: Record<typeof platform, Record<'backgroundColour' | 'colour', string>> = {
    netapp: {
      colour: corePalette.purple200,
      backgroundColour: corePalette.purple10,
    },
    dnanexus: {
      colour: corePalette.blue300,
      backgroundColour: corePalette.blue30,
    },
    ncimdss: {
      colour: corePalette.green300,
      backgroundColour: corePalette.green10,
    },
    cavatica: {
      colour: corePalette.orange200,
      backgroundColour: corePalette.orange10,
    },
  };

  return (
    <CustomChip
      {...chipColours[platform]}
      label={platform ? platform.toUpperCase() : ''}
    />
  );
}
