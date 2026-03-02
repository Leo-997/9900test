import { Box, CardHeader, IconButton } from '@mui/material';
import { Maximize2Icon } from 'lucide-react';
import PlotInfoToolTip, { PlotLegendItem } from './PlotInfoToolTip';

import type { JSX } from "react";

interface IProps {
  title: string;
  url?: string;
  legendTitle: string;
  legendData: PlotLegendItem[];
  openModal: () => void;
}

export default function PlotCardHeader({
  title,
  url,
  legendTitle,
  legendData,
  openModal,
}: IProps): JSX.Element {
  return (
    <CardHeader
      action={
        !url || (
          <IconButton onClick={openModal}>
            <Maximize2Icon />
          </IconButton>
        )
      }
      disableTypography={false}
      title={(
        <Box display="flex" alignItems="center">
          {title}
          <PlotInfoToolTip legendTitle={legendTitle} legendData={legendData} popperPlacement="right-start" />
        </Box>
      )}
    />
  );
}
