import {
  Box, styled, Tooltip,
} from '@mui/material';
import {
  EyeIcon, EyeOffIcon,
} from 'lucide-react';
import { corePalette } from '@/themes/colours';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import CustomButton from '../../Common/Button';

import type { JSX } from "react";

interface IStyledProps {
  isDownloading?: boolean;
}

const LegendContainer = styled(Box)<IStyledProps>(({ isDownloading }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  padding: '10px 50px 10px 70px',
  background: corePalette.white,
  borderRadius: '4px',
  width: isDownloading ? '1920px' : '100%',
  position: 'relative',
}));

const LegendTitle = styled('h4')({
  width: '100%',
  textAlign: 'center',
  marginBottom: '10px',
  fontSize: '14px',
  fontWeight: 'bold',
});

interface ILegendItem {
  id: string;
  colour: string;
}

interface ITSNELegendProps {
  legendItems: ILegendItem[];
  selectedGroups: Set<string>;
  showShowAllButton: boolean;
  showHideAllButton: boolean;
  onToggleGroup: (groupId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  legendOpacity: (groupId: string) => number;
  onKeyDown: (event: React.KeyboardEvent, groupId: string) => void;
  isDownloading?: boolean;
}

export function TSNELegend({
  legendItems,
  selectedGroups,
  showShowAllButton,
  showHideAllButton,
  onToggleGroup,
  onShowAll,
  onHideAll,
  legendOpacity,
  onKeyDown,
  isDownloading = false,
}: ITSNELegendProps): JSX.Element {
  const legendItemsContent = (
    <Box
      display="flex"
      flexWrap="wrap"
      gap="8px"
      justifyContent="flex-start"
      alignItems="center"
    >
      {legendItems.map((item) => (
        <Box
          display="flex"
          alignItems="center"
          gap="4px"
          padding="4px 8px"
          key={item.id}
          data-testid="legend-item-container"
          onClick={(): void => onToggleGroup(item.id)}
          onKeyDown={(event): void => onKeyDown(event, item.id)}
          role="button"
          tabIndex={0}
          sx={{
            backgroundColor: corePalette.white,
            borderRadius: '4px',
            boxShadow: `0 1px 2px ${corePalette.offBlack200}33`,
            opacity: legendOpacity(item.id),
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: corePalette.grey30,
            },
          }}
        >
          <Box
            data-testid="legend-dot"
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: item.colour,
            }}
          />
          <span>{item.id}</span>
          <Box
            data-testid="legend-separator"
            sx={{
              width: '1px',
              height: '16px',
              backgroundColor: corePalette.grey50,
              margin: '0 4px',
            }}
          />
          <Tooltip
            title={selectedGroups.has(item.id) ? 'Hide' : 'Show'}
            arrow
          >
            <Box
              data-testid="legend-eye-icon-container"
              sx={{
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              {selectedGroups.has(item.id) ? (
                <EyeIcon size={14} color={corePalette.grey100} />
              ) : (
                <EyeOffIcon size={14} color={corePalette.grey100} />
              )}
            </Box>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <LegendContainer data-testid="legend-container" isDownloading={isDownloading}>
        <LegendTitle>
          ZERO2 Subcategory 2
        </LegendTitle>
        {isDownloading ? (
          legendItemsContent
        ) : (
          <ScrollableSection
            style={{
              maxHeight: '150px',
              width: '100%',
              padding: '4px',
            }}
            data-testid="legend-scrollable"
          >
            {legendItemsContent}
          </ScrollableSection>
        )}
      </LegendContainer>
      <Box
        display="flex"
        gap="8px"
        justifyContent="center"
        width="100%"
      >
        <CustomButton
          variant="subtle"
          size="small"
          label="Hide All"
          startIcon={<EyeOffIcon />}
          onClick={onHideAll}
          sx={{ visibility: showHideAllButton ? 'visible' : 'hidden' }}
          data-testid="hide-all-button"
        />
        <CustomButton
          variant="subtle"
          size="small"
          label="Show All"
          startIcon={<EyeIcon />}
          onClick={onShowAll}
          sx={{ visibility: showShowAllButton ? 'visible' : 'hidden' }}
          data-testid="show-all-button"
        />
      </Box>
    </>
  );
}
