import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../../Common/Typography';
import { RichTextEditor } from '../../Input/RichTextEditor/RichTextEditor';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    padding: 24,
    marginBottom: 64,
    height: '100%',
    minHeight: '40vh',
  },
  title: {
    color: '#1F313D',
  },
}));

export default function ClinicalHistory(): JSX.Element {
  const classes = useStyles();
  const { patient, updateClinicalHistory, isReadOnly } = usePatient();

  const canEdit = useIsUserAuthorised('curation.sample.write');

  return (
    <Paper className={classes.root} elevation={1}>
      <RichTextEditor
        initialText={patient.clinicalHistory ?? ''}
        title={(
          <CustomTypography variant="h5" className={classes.title}>
            Clinical History
          </CustomTypography>
        )}
        mode={!canEdit || isReadOnly ? 'readOnly' : 'normal'}
        commentMode="readOnly"
        hideComments
        onSave={updateClinicalHistory}
      />
    </Paper>
  );
}
