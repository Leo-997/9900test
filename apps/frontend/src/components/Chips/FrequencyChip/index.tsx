import {
  Suspense, useMemo, useState, type JSX,
  type ReactNode,
} from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, Grid,
} from '@mui/material';
import type { VariantCounts, VariantSeenInBiosample } from '@zero-dash/types';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import CustomChip from '../../Common/Chip';
import CustomTypography from '../../Common/Typography';
import { chipColours, corePalette } from '@/themes/colours';
import CustomModal from '../../Common/CustomModal';
import FrequencyData from './FrequencyData';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import ConnectorIcon from '@/components/CustomIcons/Connector';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';

interface IProps {
  tabName: string;
  label: string;
  frequency?: number;
  counts?: VariantCounts[];
  getRows?: (
    page?: number,
    limit?: number,
  ) => Promise<VariantSeenInBiosample[]>;
  modalTitle?: ReactNode;
}

export default function FrequencyChip({
  tabName,
  label,
  frequency: inputFrequency,
  counts,
  getRows,
  modalTitle,
}: IProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const frequency = counts?.reduce((acc, count) => acc + count.count, 0) ?? inputFrequency;
  const distinctSubcat1: Record<string, number> | undefined = useMemo(() => (
    counts?.reduce((acc, count) => {
      if (acc[count.zero2Subcategory1]) {
        acc[count.zero2Subcategory1] += count.count;
      } else {
        acc[count.zero2Subcategory1] = count.count;
      }
      return acc;
    }, {})
  ), [counts]);

  return (
    <>
      <ButtonBase
        sx={{ width: 'fit-content' }}
        onClick={() => setOpen(true)}
        disabled={!getRows}
      >
        <CustomChip
          colour={chipColours.chipGreyText}
          backgroundColour={chipColours.chipGreyBg}
          sx={{
            width: 'fit-content',
          }}
          label={(
            <Grid container direction="row" alignItems="center" justifyContent="center" gap="8px">
              <CustomTypography variant="label">
                {label}
                {': '}
                <strong>
                  {frequency}
                  {' '}
                  time
                  {frequency !== 1 ? 's' : ''}
                </strong>
              </CustomTypography>
            </Grid>
          )}
        />
      </ButtonBase>
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle ?? 'Frequency'}
        showActions={{
          cancel: false,
          confirm: false,
          secondary: false,
        }}
        content={(
          <>
            {distinctSubcat1 && counts && (
              <Accordion
                expanded={expanded}
                onChange={(): void => setExpanded((prev) => !prev)}
                sx={{
                  background: corePalette.grey10,
                  border: `1px solid ${corePalette.grey30}`,
                  '& .MuiAccordion-heading': {
                    width: '100%',
                  },
                  '& .MuiCollapse-root': {
                    width: '100%',
                  },
                }}
              >
                <AccordionSummary
                  sx={{
                    width: '100%',
                    background: corePalette.grey10,
                    padding: 0,
                    '& .MuiAccordionSummary-content': {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      alignSelf: 'stretch',
                      borderRadius: '8px',
                      padding: '12px',
                      gap: '8px',
                      width: '100%',
                    },
                  }}
                >
                  <CustomTypography variant="label">
                    Seen in
                  </CustomTypography>
                  <Box display="flex" alignItems="center" gap="8px" sx={{ width: '100%' }} justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <CustomChip
                        size="large"
                        colour={chipColours.chipGreyText}
                        backgroundColour={chipColours.chipGreyBg}
                        sx={{
                          width: 'fit-content',
                        }}
                        label={(
                          <Grid container direction="row" alignItems="center" justifyContent="center" gap="8px">
                            <CustomTypography variant="label">
                              {label}
                              {': '}
                              <strong>
                                {frequency}
                                {' '}
                                time
                                {frequency !== 1 ? 's' : ''}
                              </strong>
                            </CustomTypography>
                          </Grid>
                        )}
                      />
                      <ConnectorIcon
                        sx={{
                          color: corePalette.grey30,
                          position: 'relative',
                          left: '-8px',
                        }}
                      />
                      <CustomChip
                        size="large"
                        colour={chipColours.chipGreyText}
                        backgroundColour={chipColours.chipGreyBg}
                        sx={{
                          width: 'fit-content',
                          position: 'relative',
                          left: '-16px',
                        }}
                        label={(
                          <CustomTypography variant="label">
                            {Object.keys(distinctSubcat1).length}
                            {' '}
                            Subcategory 1
                          </CustomTypography>
                        )}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap="4px">
                      <CustomTypography variant="label">
                        {expanded ? 'Hide' : 'Show'}
                        {' '}
                        Breakdown
                      </CustomTypography>
                      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    background: corePalette.grey10,
                    borderTop: `1px solid ${corePalette.grey30}`,
                    padding: '12px',
                  }}
                >
                  <ScrollableSection style={{ maxHeight: '80px', width: '100%' }}>
                    <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
                      {Object.entries(distinctSubcat1)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .map(([subcat, count]) => (
                          <CustomChip
                            key={subcat}
                            label={(
                              <CustomTypography variant="label">
                                <strong>
                                  {count}
                                  {' '}
                                  time
                                  {count !== 1 ? 's' : ''}
                                </strong>
                                {' in '}
                                {subcat}
                              </CustomTypography>
                          )}
                            pill
                            size="large"
                            colour={chipColours.chipGreyText}
                            backgroundColour={corePalette.grey10}
                            border={`1px solid ${corePalette.grey50}`}
                          />
                        ))}
                    </Box>
                  </ScrollableSection>
                </AccordionDetails>
              </Accordion>
            )}
            <Suspense
              fallback={(
                <LoadingAnimation />
              )}
            >
              <FrequencyData
                tabName={tabName}
                totalFrequency={frequency ?? 1}
                getRows={getRows}
              />
            </Suspense>
          </>
        )}
      />
    </>
  );
}
