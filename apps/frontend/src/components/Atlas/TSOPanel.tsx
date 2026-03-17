import { corePalette } from '@/themes/colours';
import { Box, styled } from '@mui/material';
import { SquareArrowOutUpRight } from 'lucide-react';
import CustomTypography from '../Common/Typography';
import {
  CardContent,
  CardWrapper,
  CustomCardActionArea,
  GeneCountBadge,
  VersionWrapper,
  ViewLinkWrapper,
} from './Common';

import type { JSX } from "react";

const Title = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  alignSelf: 'flex-start',
  gap: '8px',
  paddingBottom: '18px',
  width: '100%',
});

export default function TSOPanel(): JSX.Element {
  const EXTERNALLINK = 'https://www.illumina.com/content/dam/illumina/gcs/assembled-assets/marketing-literature/trusight-oncology-500-data-sheet-m-gl-00173/trusight-oncology-500-and-ht-data-sheet-m-gl-00173.pdf';

  return (
    <CardWrapper>
      <CustomCardActionArea onClick={(): WindowProxy | null => window.open(EXTERNALLINK, '_blank')}>
        <CardContent>
          <Title>
            <CustomTypography variant="titleRegular" fontWeight="medium">
              TSO500
            </CustomTypography>
            <GeneCountBadge>
              <CustomTypography variant="label" sx={{ letterSpacing: '0.784px', fontSize: '11.2px' }}>
                523* genes
              </CustomTypography>
            </GeneCountBadge>
          </Title>

          <VersionWrapper>
            <CustomTypography variant="bodySmall" color={corePalette.grey100}>
              *TSO500 panel sequencing includes coverage of 523 genes for SNVs, indels, CNVs; and
              55 genes for known and novel fusion and splice variants.
            </CustomTypography>
          </VersionWrapper>
        </CardContent>

        <ViewLinkWrapper>
          <CustomTypography variant="bodySmall" color="inherit" textAlign="right" truncate fontWeight="medium">
            View TSO500 Product Information
          </CustomTypography>
          <SquareArrowOutUpRight size={20} />
        </ViewLinkWrapper>
      </CustomCardActionArea>
    </CardWrapper>
  );
}
