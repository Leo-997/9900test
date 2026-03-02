import { Box, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  curationTextPad: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '10px',
    gap: '10px',
    width: '100%',
    minHeight: '104px',
    border: '1px solid #D0D9E2',
    borderRadius: '8px',
  },
  addSlideButton: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '4px',
    width: '135px',
    height: '32px',
    border: '1px solid #1E86FC',
    borderRadius: '8px',
  },
  buttonText: {
    width: '79px',
    height: '20px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: '#1E86FC',
  },
  reportBox: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '24px',
    width: '100%',
    minHeight: '104px',
    background: 'white',
  },
  markdown: {
    paddingBottom: 4,

    '& p': {
      fontSize: 16,
      margin: '8px 0 0 0',
    },
  },
}));

export interface IProps {
  comment: string;
  enableAddButton?: boolean;
}

export default function CommentPanel({
  comment,
  enableAddButton = true,
}: IProps): JSX.Element {
  const classes = useStyles();
  return (
    <Box className={classes.reportBox}>
      <Box style={{ gap: '24px' }} className={classes.curationTextPad}>
        <Box
          component="span"
          sx={{
            paddingBottom: 4,
            '& p': {
              fontSize: 16,
              margin: '8px 0 0 0',
            },
          }}
        >
          <ReactMarkdown>
            {comment || 'No comments found'}
          </ReactMarkdown>
        </Box>
      </Box>
      {enableAddButton && (
        <IconButton className={classes.addSlideButton}>
          <PlusIcon
            size={20}
          />
          <CustomTypography variant="bodySmall" className={classes.buttonText}>
            Add to Slide
          </CustomTypography>
        </IconButton>
      )}
    </Box>
  );
}
