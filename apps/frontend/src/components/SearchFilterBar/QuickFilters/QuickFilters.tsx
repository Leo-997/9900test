import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { IQuickFilter } from '@/types/Common.types';
import { SearchOptions } from '@/types/Search.types';
import {
  Box, Popover, styled, SxProps, Theme,
} from '@mui/material';
import { useRef, useState, type JSX } from 'react';
import QuickFilterButton from './QuickFilterButton';

const StyledScrollableSection = styled(Box)({
  minHeight: '36px',
  display: 'flex',
  alignItems: 'center',
});

interface IQuickFiltersProps<T extends SearchOptions> {
  label?: string;
  labelSx?: SxProps<Theme>;
  quickFilters: IQuickFilter<T>[];
  toggled?: T;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function QuickFilters<T extends SearchOptions>({
  label = 'Quick filters',
  labelSx,
  quickFilters,
  toggled,
  isLoading,
  disabled,
}: IQuickFiltersProps<T>): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const quickFiltersWrapperRef = useRef<HTMLDivElement>(null);
  const overflowChipRef = useRef<HTMLButtonElement>(null);

  // Sorts by active filters first
  const sortByActiveStatus = (a: IQuickFilter<T>, b: IQuickFilter<T>): number => {
    if (!toggled) return 0;
    return Number(b.checkIsActive(toggled)) - Number(a.checkIsActive(toggled));
  };

  const visibleQuickFilters = toggled
    ? quickFilters
      .toSorted(sortByActiveStatus)
      .slice(0, 3)
    : [];
  const overflowCount = quickFilters.length - 3;

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>): void => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setAnchorEl(null);
    }
  };

  const areAllQfDisabled = quickFilters.every((qf) => qf.disabled);

  return (
    <StyledScrollableSection>
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        padding="0 8px 0px 12px"
      >
        {label && (
        <CustomTypography
          variant="bodySmall"
          sx={{
            minWidth: '80px',
            ...labelSx,
          }}
        >
          {label}
        </CustomTypography>
        )}
        <Box
          ref={quickFiltersWrapperRef}
          width="100%"
          display="flex"
          gap="8px"
          onMouseEnter={(e): void => setAnchorEl(e.currentTarget)}
        >
          {visibleQuickFilters.map((q) => (
            <QuickFilterButton
              key={q.label}
              toggled={toggled}
              data={q}
              isLoading={isLoading}
              disabled={disabled}
            />
          ))}
          {overflowCount > 0 && (
            <>
              <CustomButton
                ref={overflowChipRef}
                label={`+ ${overflowCount} more`}
                variant="outline"
                size="small"
                disabled={areAllQfDisabled}
              />
              <Popover
                id="quick-filters-popover"
                open={Boolean(anchorEl) && !areAllQfDisabled}
                anchorEl={anchorEl}
                onClose={(): void => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: -10,
                  horizontal: 'left',
                }}
                slotProps={{
                  paper: {
                    onMouseLeave: handleMouseLeave,
                    sx: { borderRadius: '8px' },
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  padding="8px"
                  maxWidth={(quickFiltersWrapperRef.current?.clientWidth || 0) + 100}
                  flexWrap="wrap"
                >
                  {quickFilters
                    .toSorted(sortByActiveStatus)
                    .map((q) => (
                      <QuickFilterButton
                        key={q.label}
                        toggled={toggled}
                        data={q}
                        isLoading={isLoading}
                        tooltipPlacement="top"
                        disabled={disabled}
                      />
                    ))}
                </Box>
              </Popover>
            </>
          )}
        </Box>
      </Box>
    </StyledScrollableSection>
  );
}
