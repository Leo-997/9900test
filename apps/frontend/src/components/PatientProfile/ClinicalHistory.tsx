import { Grid } from '@mui/material';
import type { JSX } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../Common/Typography';
import { RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';

export default function ClinicalHistory(): JSX.Element {
  const { patient, updateClinicalHistory, isReadOnly } = usePatient();
  const canEdit = useIsUserAuthorised('curation.patient.write');

  return patient.patientId ? (
    <Grid
      bgcolor={corePalette.white}
      padding="24px"
      borderRadius="8px"
      size={12}
    >
      <RichTextEditor
        initialText={patient.clinicalHistory ?? ''}
        title={(
          <CustomTypography variant="titleRegular" fontWeight="medium">
            Clinical History
          </CustomTypography>
        )}
        mode={!canEdit || isReadOnly ? 'readOnly' : 'normal'}
        commentMode="readOnly"
        hideComments
        onSave={updateClinicalHistory}
      />
    </Grid>
  ) : <div />;
}
