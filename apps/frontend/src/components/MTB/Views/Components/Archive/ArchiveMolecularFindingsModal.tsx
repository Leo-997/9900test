import { Box } from '@mui/material';
import CustomDialog from '../../../../Common/CustomDialog';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import { IClinicalVersionRaw } from '../../../../../types/MTB/MTB.types';
import { MolecularFindingsView } from '../../MolecularFindingsView';

import type { JSX } from "react";

interface IProps {
  open: boolean;
  onClose: () => void;
  clinicalVersion: IClinicalVersionRaw;
}

export default function ArchiveMolecularFindingsModal({
  open,
  onClose,
  clinicalVersion,
}: IProps): JSX.Element {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Molecular findings"
      content={(
        <ScrollableSection style={{ maxHeight: '100%' }}>
          <Box display="flex" flexDirection="column" gap="16px" paddingBottom="16px" width="100%">
            {clinicalVersion && (
              <MolecularFindingsView
                clinicalVersionId={clinicalVersion?.id}
                frequencyUnits={clinicalVersion.frequencyUnits}
                isPresentationMode
              />
            )}
          </Box>
        </ScrollableSection>
      )}
    />
  );
}
