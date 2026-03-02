import CustomChip from '@/components/Common/Chip';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { IGeneListGene } from '@/types/Reports/GeneLists.types';
import { Box, styled, Tooltip } from '@mui/material';
import { Dna } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type JSX } from 'react';

interface IArchiveGeneCardProps {
  gene: IGeneListGene;
  listType: string;
  nameWidth: number;
}

const GeneCell = styled(Box)({
  padding: '1vh',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'left',
  alignItems: 'center',
  borderBottom: `1px solid ${corePalette.grey50}`,
  borderRight: `1px solid ${corePalette.grey50}`,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: corePalette.grey10,
  },
  height: '60px',
  backgroundColor: corePalette.white,
});

const NameWrapper = styled(Box)<{ namewidth: number }>(({ namewidth }) => ({
  display: 'flex',
  justifyContent: 'left',
  alignItems: 'center',
  borderRight: `1px solid ${corePalette.grey30}`,
  width: `${namewidth}px`,
  padding: '3px',
  whiteSpace: 'nowrap',
}));

const ChipsAndOverflowWrapper = styled(Box)<{ namewidth: number }>(({ namewidth }) => ({
  width: `calc(100% - ${namewidth}px - 5px)`,
  marginLeft: '5px',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px',
}));

const ChipsWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '5px',
});

const ToolTipContent = styled(Box)({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});

const ToolTipTitleWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'left',
  flexDirection: 'row',
  borderBottom: `solid 1px ${corePalette.grey30}`,
  paddingBottom: '5px',
  marginBottom: '10px',
  color: corePalette.offBlack100,
});

const ToolTipChipsEvidenceContent = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '10px',
});

const ToolTipChipsWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
});

const ToolTipChipWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '0.5vw',
  flexWrap: 'wrap',
  marginLeft: '1vw',
  maxWidth: '45%',
  width: 'fit-content',
});

export default function ArchiveGeneCard({
  gene,
  listType,
  nameWidth,
} : IArchiveGeneCardProps): JSX.Element {
  const [visibleCount, setVisibleCount] = useState<number>(gene.panels?.length || 0);
  const archiveChipWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const calculateVisibleChips = (): void => {
      const wrapper = archiveChipWrapperRef.current;
      if (wrapper) {
        const chips = Array.from(wrapper.children) as HTMLElement[];
        const wrapperRight = wrapper.getBoundingClientRect().right - 10;
        const overflowChipEstimatedWidth = 30;
        let howMany = 0;
        for (let i = 0; i < chips.length; i += 1) {
          const chipRight = chips[i].getBoundingClientRect().right;

          const remaining = (gene.panels?.length || 0) - (i + 1);

          if (chipRight > wrapperRight - (remaining > 0 ? overflowChipEstimatedWidth : 0)) {
            break;
          }
          howMany += 1;
        }
        setVisibleCount(howMany);
      }
    };

    calculateVisibleChips();
    window.addEventListener('resize', calculateVisibleChips);
  }, [gene.panels, nameWidth]);

  const panelsToDisplay = gene.panels?.slice(0, visibleCount);
  const overflowCount = (gene.panels?.length || 0) - visibleCount;

  return (
    <Tooltip
      title={(
        <ToolTipContent>
          {gene.isSomaticGermline && listType === 'somatic' ? (
            <ToolTipTitleWrapper>
              <CustomTypography fontWeight="medium" sx={{ marginRight: '0.2vw' }}>
                {gene.gene}
              </CustomTypography>
              <Dna
                style={{
                  marginLeft: '0.3vw',
                  marginRight: '0.3vw',
                  height: '20px',
                  width: '20px',
                }}
              />
            </ToolTipTitleWrapper>
          ) : (
            <ToolTipTitleWrapper>
              <CustomTypography fontWeight="medium" sx={{ marginRight: '0.2vw' }}>
                {gene.gene}
              </CustomTypography>
            </ToolTipTitleWrapper>
          )}
          <ToolTipChipsEvidenceContent>
            <ToolTipChipsWrapper>
              <CustomTypography fontSize="12px" color={corePalette.grey100}>
                Included In Gene List
              </CustomTypography>
            </ToolTipChipsWrapper>
            <ToolTipChipWrapper>
              {gene.panels?.sort((a, b) => a.code.localeCompare(b.code)).map((panel) => (
                <Box key={panel.code}>
                  <CustomChip
                    label={panel.code}
                    size="small"
                    pill={false}
                    backgroundColour={corePalette.grey30}
                  />
                </Box>
              ))}
            </ToolTipChipWrapper>
          </ToolTipChipsEvidenceContent>
        </ToolTipContent>
      )}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: corePalette.white,
            boxShadow: `0 12px 28px ${corePalette.grey50}`,
            padding: '1vw',
            justifyContent: 'flex-start',
            alignItems: 'column',
            width: 'calc((100vw - 3.6vw) / 5)',
            minWidth: '100%',
          },
        },
      }}
      enterDelay={750}
      enterNextDelay={200}
    >
      <GeneCell>
        {gene.isSomaticGermline && listType === 'somatic' ? (
          <NameWrapper namewidth={nameWidth}>
            <CustomTypography fontWeight="medium" sx={{ marginRight: '0.2vw' }}>
              {gene.gene}
            </CustomTypography>
            <Dna
              style={{
                marginLeft: '0.3vw',
                marginRight: '0.3vw',
                height: '22px',
                width: '22px',
              }}
            />
          </NameWrapper>
        ) : (
          <NameWrapper namewidth={nameWidth}>
            <CustomTypography fontWeight="medium" sx={{ marginRight: '0.2vw' }}>
              {gene.gene}
            </CustomTypography>
          </NameWrapper>
        )}
        <ChipsAndOverflowWrapper namewidth={nameWidth}>
          <ChipsWrapper ref={archiveChipWrapperRef} data-testid="inline-chips">
            {panelsToDisplay?.sort().map((name) => (
              <CustomChip
                data-testid="inline-chip"
                key={name.code}
                label={name.code}
                size="small"
                backgroundColour={corePalette.grey30}
                pill={false}
              />
            ))}
            {overflowCount > 0 && (
              <CustomChip
                data-testid="overflow-chip"
                label={`+${overflowCount}`}
                size="medium"
                backgroundColour={corePalette.blank}
                pill={false}
                fontWeight="bold"
              />
            )}
          </ChipsWrapper>
        </ChipsAndOverflowWrapper>
      </GeneCell>
    </Tooltip>
  );
}
