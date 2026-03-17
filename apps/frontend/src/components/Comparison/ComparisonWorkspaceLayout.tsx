import { Box, type JSX } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode } from 'react';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { corePalette } from '@/themes/colours';

const useStyles = makeStyles(() => ({
  page: {
    backgroundColor: '#F3F5F7',
    height: 'calc(100vh - 80px)',
    width: '100%',
    padding: '24px',
    display: 'flex',
    gap: '24px',
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '360px',
    minWidth: '360px',
    height: '100%',
    backgroundColor: corePalette.white,
    borderRadius: '16px',
    border: `1px solid ${corePalette.grey30}`,
    overflow: 'hidden',
  },
  workspace: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    backgroundColor: '#F0F4F7',
    borderRadius: '16px',
    border: `1px solid ${corePalette.grey30}`,
    overflow: 'hidden',
  },
  scroll: {
    height: '100%',
    width: '100%',
  },
}));

interface IProps {
  leftPanel: ReactNode;
  workspace: ReactNode;
}

export default function ComparisonWorkspaceLayout({
  leftPanel,
  workspace,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.page}>
      <Box className={classes.sidebar}>
        <ScrollableSection className={classes.scroll}>
          {leftPanel}
        </ScrollableSection>
      </Box>
      <Box className={classes.workspace}>
        <ScrollableSection className={classes.scroll}>
          {workspace}
        </ScrollableSection>
      </Box>
    </Box>
  );
}
