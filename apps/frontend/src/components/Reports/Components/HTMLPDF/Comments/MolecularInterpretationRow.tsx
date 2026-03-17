import {
  Box, Grid,
} from '@mui/material';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { makeStyles } from '@mui/styles';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  commentBox: {
    padding: '0px 8px 8px 8px',
    maxHeight: 'none',
    overflowWrap: 'normal',
  },
  box: {
    width: '100%',
    alignItems: 'flex-start',
    color: '#62728C !important',
    padding: '8px',
    maxHeight: 'none',
    border: '1px solid #ECF0F3',
    borderColor: '#ECF0F3 !important',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    '& *': {
      fontSize: '13px !important',
      lineHeight: 1.43,
      letterSpacing: '0.25px',
    },
  },
}));

interface IInterpretationRowProps {
  text: string;
}

export function InterpretationRow({
  text,
}: IInterpretationRowProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container direction="row" className={classes.commentBox}>
      <Box className={classes.box}>
        {text && (
          <RichTextEditor
            initialText={text}
            condensed
            mode="readOnly"
          />
        )}
      </Box>
    </Grid>
  );
}
