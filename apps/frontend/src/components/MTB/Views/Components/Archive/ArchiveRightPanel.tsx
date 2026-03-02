import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { archiveTabOptions } from '../../../../../constants/Clinical/archive';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { ArchiveTabs } from '../../../../../types/MTB/Archive.types';
import CustomTabs from '../../../../Common/CustomTabs';
import CustomTypography from '../../../../Common/Typography';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import ArchiveAllSlideSections from './ArchiveAllSlideSections';
import ArchiveRecommendations from './ArchiveRecommendations';
import ArchiveSlides from './ArchiveSlides';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  wrapper: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px 8px 0px 0px',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollable: {
    width: '100%',
    height: 'calc(100% - 16px)',
    marginTop: '16px',
    padding: '16px',
    paddingTop: '0px',
  },
}));

interface IProps {
  defaultTab?: ArchiveTabs;
}

export default function ArchiveRightPanel({
  defaultTab = 'SLIDES',
}: IProps): JSX.Element {
  const classes = useStyles();
  const { selectedSample } = useMTBArchive();

  const [selectedTab, setSelectedTab] = useState<ArchiveTabs>(defaultTab);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      className={classes.root}
    >
      <CustomTabs
        defaultTab={archiveTabOptions.find((tab) => tab.value === defaultTab)}
        tabs={archiveTabOptions}
        onChange={(newTab): void => setSelectedTab(newTab)}
      />
      <Box className={classes.wrapper}>
        {!selectedSample && (
          <CustomTypography
            style={{
              color: '#5E6871',
              textAlign: 'center',
              padding: '0px 16px',
            }}
          >
            Select a sample to see previously created
            slides, recommendations, and germline sections here.
          </CustomTypography>
        )}
        {selectedSample && (
          <ScrollableSection className={classes.scrollable}>
            {selectedTab === 'SLIDES' && (
              <ArchiveSlides />
            )}
            {selectedTab === 'RECOMMENDATIONS' && (
              <Box
                display="flex"
                flexDirection="column"
                gap="16px"
                minWidth="50vw"
              >
                <ArchiveRecommendations
                  filters={{
                    entityType: 'SLIDE',
                  }}
                />
              </Box>
            )}
            {selectedTab === 'SECTIONS' && (
              <ArchiveAllSlideSections />
            )}
          </ScrollableSection>
        )}
      </Box>
    </Box>
  );
}
