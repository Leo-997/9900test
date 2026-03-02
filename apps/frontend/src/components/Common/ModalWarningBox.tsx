import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TriangleAlertIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import CustomTypography from './Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  warning: {
    height: 'fit-content',
    padding: '12px',
    border: '1px solid #F8CA19',
    borderRadius: '8px',
    backgroundColor: '#FFFAE8',
  },
}));

interface IProps {
  summary: string;
  message: string;
}

export default function ModalWarningBox({
  summary,
  message,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.warning}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <TriangleAlertIcon style={{ marginRight: '12px', color: corePalette.yellow200 }} />
        <Box>
          <CustomTypography
            fontWeight="bold"
            style={{ paddingBottom: '3px' }}
          >
            {summary}
          </CustomTypography>
          <CustomTypography>
            {message}
          </CustomTypography>
        </Box>
      </Box>
    </Box>
  );
}
