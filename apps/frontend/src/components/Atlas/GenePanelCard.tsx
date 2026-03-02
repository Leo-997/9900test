import { corePalette } from '@/themes/colours';
import { IGeneList } from '@/types/Reports/GeneLists.types';
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

interface IGenePanelCardProps {
  name: string;
  abbreviation: string;
  somaticObject?: {
    list?: IGeneList;
    matchingGenesCount?: number;
  },
  germlineObject?: {
    list?: IGeneList;
    matchingGenesCount?: number;
  },
  highlightedName?: React.ReactNode;
}

const SomaticGermlineWrapper = styled('div')({
  width: '100%',
  padding: '8px',
  borderRadius: '8px',
  border: `1px solid ${corePalette.grey30}`,
  background: corePalette.grey10,
});

const LabelWrapper = styled('div')({
  display: 'flex',
  alignItems: 'top',
  marginBottom: '12px',
  alignSelf: 'stretch',
  justifyContent: 'space-between',
});

export default function GenePanelCard({
  name,
  abbreviation,
  somaticObject,
  germlineObject,
  highlightedName,
}: IGenePanelCardProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <CardWrapper>
      <CustomCardActionArea onClick={(): Promise<void> | void => navigate(`/atlas/gene-dashboard/gene-panel/${encodeURIComponent(name)}`)}>
        <CardContent sx={{ gap: '16px' }}>
          <CustomTypography variant="titleRegular" fontWeight="medium">
            {highlightedName || abbreviation}
          </CustomTypography>

          {somaticObject && (
            <SomaticGermlineWrapper>
              <LabelWrapper>
                <CustomTypography variant="bodyRegular" fontWeight="medium">
                  Somatic
                </CustomTypography>
                <Box
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
                  }}
                >
                  <GeneCountBadge>
                    <CustomTypography variant="label" sx={{ letterSpacing: '0.784px', fontSize: '11.2px' }}>
                      {somaticObject.list?.geneCount !== null ? (
                        <>
                          {somaticObject.list?.geneCount.toLocaleString('en', { useGrouping: true })}
                          {' '}
                          genes
                        </>
                      ) : '-'}
                    </CustomTypography>
                  </GeneCountBadge>
                  {(
                    somaticObject.matchingGenesCount !== undefined
                      && somaticObject.matchingGenesCount > 0
                  ) && (
                  <GeneMatchBadge>
                    <CustomTypography variant="label" whiteSpace="nowrap">
                      {somaticObject.matchingGenesCount.toLocaleString('en')}
                      {' '}
                      {somaticObject.matchingGenesCount === 1 ? 'match' : 'matches'}
                    </CustomTypography>
                  </GeneMatchBadge>
                  )}
                </Box>
              </LabelWrapper>

              <VersionWrapper>
                <VersionText>
                  V
                  {somaticObject.list?.version}
                </VersionText>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CustomTypography variant="bodySmall" color={corePalette.grey100}>
                    Last updated:
                  </CustomTypography>
                  <CustomTypography fontWeight="bold" variant="label">
                    {dayjs(somaticObject.list?.updatedAt).format('DD / MM / YYYY')}
                  </CustomTypography>
                </Box>
              </VersionWrapper>
            </SomaticGermlineWrapper>
          )}

          {germlineObject && (
            <SomaticGermlineWrapper>
              <LabelWrapper>
                <CustomTypography variant="bodyRegular" fontWeight="medium">
                  Germline
                </CustomTypography>
                <Box
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
                  }}
                >
                  <GeneCountBadge>
                    <CustomTypography variant="label" sx={{ letterSpacing: '0.784px', fontSize: '11.2px' }}>
                      {germlineObject.list?.geneCount !== null ? (
                        <>
                          {germlineObject.list?.geneCount.toLocaleString('en', { useGrouping: true })}
                          {' '}
                          genes
                        </>
                      ) : '-'}
                    </CustomTypography>
                  </GeneCountBadge>
                  {(
                    germlineObject.matchingGenesCount !== undefined
                    && germlineObject.matchingGenesCount > 0
                  ) && (
                    <GeneMatchBadge>
                      <CustomTypography variant="label" whiteSpace="nowrap">
                        {germlineObject.matchingGenesCount.toLocaleString('en')}
                        {' '}
                        {germlineObject.matchingGenesCount === 1 ? 'match' : 'matches'}
                      </CustomTypography>
                    </GeneMatchBadge>
                  )}
                </Box>
              </LabelWrapper>

              <VersionWrapper>
                <VersionText>
                  V
                  {germlineObject.list?.version}
                </VersionText>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CustomTypography variant="bodySmall" color={corePalette.grey100}>
                    Last updated:
                  </CustomTypography>
                  <CustomTypography fontWeight="bold" variant="label">
                    {dayjs(germlineObject.list?.updatedAt).format('DD / MM / YYYY')}
                  </CustomTypography>
                </Box>
              </VersionWrapper>
            </SomaticGermlineWrapper>
          )}
        </CardContent>

        <ViewLinkWrapper>
          <CustomTypography variant="bodySmall" color="inherit" textAlign="right" truncate fontWeight="medium">
            View
            {' '}
            {abbreviation}
            {' '}
            Gene Panel
          </CustomTypography>
          <ArrowRightIcon size={20} style={{ flexShrink: 0 }} />
        </ViewLinkWrapper>
      </CustomCardActionArea>
    </CardWrapper>
  );
}
