import { Box } from '@mui/material';
import { corePalette } from '@/themes/colours';
import EvidencesPanel from '../../Modals/Components/Evidences/EvidencesPanel';
import ActiveDrugPanel from '../../Modals/Components/Therapies/ActiveDrugPanel';

import type { JSX } from "react";

export default function RecommendationRightPanel(): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="50%"
      height="100%"
      position="relative"
      borderRadius="16px 0px 0px 0px"
      padding="24px"
      bgcolor={corePalette.white}
    >
      <EvidencesPanel activeDrugPanel={(<ActiveDrugPanel />)} />
    </Box>
  );
}
