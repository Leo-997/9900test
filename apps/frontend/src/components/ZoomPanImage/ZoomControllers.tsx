import { Box, IconButton, styled } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { MinusIcon, PlusIcon } from 'lucide-react';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

const ZoomPanel = styled(Box)(() => ({
  height: 0,
  display: 'flex',
  position: 'absolute',
  right: '50px',
  bottom: 200,
  flexDirection: 'column',
  width: 60,
}));

const useStyles = makeStyles(() => createStyles({
  zoomLevel: {
    fontSize: '23px',
    verticalAlign: 'center',
    textAlign: 'center',
  },
  button: {
    width: '48px',
    height: '48px',
    margin: 6,
    color: 'rgb(2, 32, 52)',
    backgroundColor: 'rgb(243, 245, 247)',
    '&:hover': {
      backgroundColor: '#D7EAFC',
      color: '#1E86FC',
    },
  },
  icon: {
    color: 'black',
  },
}));

interface IProps {
  scale: number;
  className?: string;
  zoomIn: () => void;
  zoomOut: () => void;
}

export default function ZoomControllers({
  scale,
  className,
  zoomIn,
  zoomOut,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <ZoomPanel className={className}>
      <IconButton className={classes.button} onClick={(): void => zoomIn()}>
        <PlusIcon />
      </IconButton>
      <IconButton className={classes.button} onClick={(): void => zoomOut()}>
        <MinusIcon />
      </IconButton>
      <CustomTypography variant="h6" className={classes.zoomLevel}>
        {Math.round(scale * 100)}
        %
      </CustomTypography>
    </ZoomPanel>
  );
}
