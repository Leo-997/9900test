import { corePalette } from '@/themes/colours';
import { Box, styled } from '@mui/material';
import dayjs from 'dayjs';
import { ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomTypography from '../Common/Typography';
import {
  CardContent,
  CardWrapper,
  CustomCardActionArea,
  GeneCountBadge,
  GeneMatchBadge,
  VersionText,
  VersionWrapper,
  ViewLinkWrapper,
} from './Common';

import type { JSX } from "react";

interface IGeneListCardProps {
  id: string;
  name: string;
  highlightedName?: React.ReactNode;
  geneCount: number | null;
  version: string;
  lastUpdated?: string;
  geneMatchCount?: number;
  sx?: React.CSSProperties;
}

const Title = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  alignSelf: 'flex-start',
  gap: '8px',
  paddingBottom: '18px',
  width: '100%',
});

export default function GeneListCard({
  id,
  name,
  highlightedName,
  geneCount,
  version,
  lastUpdated,
  geneMatchCount,
  sx = {},
}: IGeneListCardProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <CardWrapper sx={sx}>
      <CustomCardActionArea onClick={(): Promise<void> | void => navigate(`/atlas/gene-dashboard/gene-list/${id}`)}>
        <CardContent sx={{ position: 'relative' }}>
          <Title>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'flex-start',
              }}
            >
              <CustomTypography
                variant="titleRegular"
                fontWeight="medium"
                sx={{ maxWidth: '63%', wordBreak: 'break-word' }}
              >
                {highlightedName || name}
              </CustomTypography>
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
              }}
              >
                <GeneCountBadge>
                  <CustomTypography variant="label" whiteSpace="nowrap">
                    {geneCount !== null ? (
                      <>
                        {geneCount.toLocaleString('en')}
                        {' '}
                        genes
                      </>
                    ) : '-'}
                  </CustomTypography>
                </GeneCountBadge>

                {(geneMatchCount !== undefined && geneMatchCount > 0) && (
                  <GeneMatchBadge>
                    <CustomTypography variant="label" whiteSpace="nowrap">
                      {geneMatchCount.toLocaleString('en')}
                      {' '}
                      {geneMatchCount === 1 ? 'match' : 'matches'}
                    </CustomTypography>
                  </GeneMatchBadge>
                )}
              </Box>
            </Box>
          </Title>
          <VersionWrapper>
            <VersionText>
              V
              {version}
            </VersionText>
            {lastUpdated && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CustomTypography variant="bodySmall" color={corePalette.grey100}>
                  Last updated:
                </CustomTypography>
                <CustomTypography fontWeight="bold" variant="label">
                  {dayjs(lastUpdated).format('DD / MM / YYYY')}
                </CustomTypography>
              </Box>
            )}
          </VersionWrapper>
        </CardContent>

        <ViewLinkWrapper>
          <CustomTypography variant="bodySmall" color="inherit" textAlign="right" truncate fontWeight="medium">
            View
            {' '}
            {name}
          </CustomTypography>
          <ArrowRightIcon size={20} style={{ flexShrink: 0 }} />
        </ViewLinkWrapper>
      </CustomCardActionArea>
    </CardWrapper>
  );
}
