import {
  Accordion, AccordionSummary, Typography, AccordionDetails,
} from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import { JSX, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { corePalette } from '@/themes/colours';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import type { IClassifierVersion } from '@/types/Classifiers.types';

interface IProps {
  classifier: IClassifierVersion;
}

export default function TumourClassifierNote({ classifier }: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const canEdit = useIsUserAuthorised('atlas.write');
  const editorRef = useRef<IRTERef | null>(null);

  const handleSubmit = async (newText: string): Promise<void> => {
    try {
      if (classifier.type === 'METHYLATION_CLASSIFIER') {
        await zeroDashSdk.methylation.updateClassifier(
          classifier.id,
          { note: newText },
        );
      } else {
        await zeroDashSdk.rna.updateClassifier(
          classifier.id,
          { note: newText },
        );
      }
      enqueueSnackbar(`${classifier.description} V${classifier.version} updated.`, { variant: 'success' });
    } catch {
      enqueueSnackbar(`Cannot update ${classifier.description} V${classifier.version}, please try again.`, { variant: 'error' });
    }
  };

  return (
    <Accordion
      key={`${classifier.description}-${classifier.version}`}
      sx={{
        border: `1px solid ${corePalette.grey50}`,
        borderRadius: '12px',
        bgcolor: corePalette.white,
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<GridExpandMoreIcon />}
        sx={{
          flexDirection: 'row-reverse',
          padding: '24px',
        }}
      >
        <Typography variant="h3" fontWeight={500}>
          {`${classifier.description} V${classifier.version}`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '24px', paddingTop: '0' }}>
        <RichTextEditor
          ref={editorRef}
          initialText={classifier.note ?? ''}
          mode={canEdit ? 'normal' : 'readOnly'}
          commentMode="readOnly"
          hideComments
          disableSaveOnEmpty
          title={(
            <div />
          )}
          onSave={(newVal) => {
            handleSubmit(newVal);
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
}
