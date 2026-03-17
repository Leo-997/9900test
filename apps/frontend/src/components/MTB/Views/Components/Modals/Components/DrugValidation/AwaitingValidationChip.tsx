import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';

import type { JSX } from "react";

export default function AwaitingValidationChip(): JSX.Element {
  return (
    <CustomChip
      label="AWAITING VALIDATION"
      size="small"
      pill
      backgroundColour={corePalette.yellow10}
      colour={corePalette.grey200}
      sx={{
        border: `1px solid ${corePalette.yellow150}`,
      }}
    />
  );
}
