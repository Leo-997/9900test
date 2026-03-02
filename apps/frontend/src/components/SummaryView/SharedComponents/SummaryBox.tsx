import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import type { JSX } from 'react';
import CustomTypography from '../../Common/Typography';

import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';

const useStyles = makeStyles(() => ({
  summarySection: {
    position: 'relative',
    padding: 4,
    paddingLeft: 48,
    paddingRight: 48,
    paddingBottom: 16,
    width: '100%',
  },
  editor: {
    maxHeight: '450px',
  },
}));

interface IProps {
  summary: string;
  placeholder?: string;
  title?: string;
  className?: string;
  submitChanges: (newSummary: string) => void;
  canEdit?: boolean;
}

export default function SummaryBox({
  summary,
  placeholder,
  className,
  title = 'Curator Notes',
  submitChanges,
  canEdit,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={clsx(classes.summarySection, className)}>
      <RichTextEditor
        key={summary}
        title={(
          <CustomTypography variant="label">
            {title}
          </CustomTypography>
        )}
        mode={canEdit ? 'normal' : 'readOnly'}
        initialText={summary}
        placeholder={placeholder || 'Final Curation Summary Comments'}
        onSave={submitChanges}
        disablePlugins={['table', 'evidence']}
        classNames={{
          editor: classes.editor,
        }}
      />
    </Box>
  );
}
