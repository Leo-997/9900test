import { Box, IconButton, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ArrowRightIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { ScrollableSection } from '../../components/ScrollableSection/ScrollableSection';

interface IExpandIconButtonProps {
  reversed?: boolean;
}

const ExpandIconButton = styled(IconButton)<IExpandIconButtonProps>(({ theme, reversed }) => ({
  background: theme.colours.core.white,
  border: `1px solid ${theme.colours.core.grey30}`,
  boxSizing: 'border-box',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
  borderRadius: '100px',
  position: 'absolute',
  left: -25,
  top: 17,
  zIndex: 600,
  transition: 'all 0.7s cubic-bezier(.19,1,.22,1)',

  '&:hover': {
    background: theme.colours.core.grey10,
  },
  ...(
    reversed ? {
      marginLeft: 'auto',
      transform: 'rotate(-180deg)',
    } : {}
  ),
}));

const useStyles = makeStyles(() => ({
  paper: {
    minWidth: '100vw',
    height: '100vh',
    margin: 0,
  },
  title: {
    height: '80px',
    maxHeight: '80px',
    padding: 0,
  },
  content: {
    padding: 0,
    flexGrow: 1,
    background: '#FAFBFC',
    display: 'flex',
    flexWrap: 'nowrap',
    margin: 0,
    height: 'calc(100vh - 80px)',
  },
  leftPane: {
    minWidth: '400px',
    width: '20%',
    height: '100%',
    display: 'flex',
    padding: '24px',
  },
  leftPaneScroll: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: '4px',
  },
  rightPane: {
    minWidth: '23px',
    width: '23px',
    height: '100%',
    display: 'flex',
    padding: '24px',
    position: 'relative',
  },
  rightPaneScroll: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: '4px',
    zIndex: 1000,
  },
  mainContentPane: {
    width: '100%',
    height: '100%',
    display: 'flex',
    padding: '24px 0px 0px 0px',
    minWidth: '810px',
  },
  mainContentContainer: {
    height: '100%',
    width: '100%',
    borderRadius: '16px 0 0 0',
    backgroundColor: '#F0F4F7',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mainContentScroll: {
    height: '100%',
    width: '100%',
    padding: '24px 0',
  },
  mainContentWrapper: {
    // screen height - navbar - marging and padding
    minHeight: 'calc(100vh - 80px - 72px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));

interface IClassNames {
  dialog?: string;
  mainContent?: string;
}

interface IProps {
  navBar: JSX.Element;
  mainContent: JSX.Element;
  leftPaneNodes?: JSX.Element[] | JSX.Element;
  rightPaneNodes?: JSX.Element[] | JSX.Element;
  includeLeftPane?: boolean;
  includeRightPane?: boolean;
  classNames?: IClassNames;
}

export function ItemSelectLayout({
  navBar,
  mainContent,
  leftPaneNodes,
  rightPaneNodes,
  includeLeftPane = true,
  includeRightPane = false,
  classNames,
}: IProps): JSX.Element {
  const classes = useStyles();
  const [rightPaneOpen, setRightPaneOpen] = useState(true);

  const getMainContentWidth = (): string => {
    const leftPaneWidth = includeLeftPane ? '-20%' : '';
    const rightPaneWidth = rightPaneOpen ? '120px' : '23px';

    return `calc(100% ${leftPaneWidth} ${includeRightPane ? rightPaneWidth : ''})`;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      className={clsx(classes.paper, classNames?.dialog)}
    >
      <Box
        display="flex"
        className={classes.title}
        style={{ zIndex: 1 }}
      >
        {navBar}
      </Box>
      <ScrollableSection
        style={{
          maxWidth: '100vw',
          height: 'calc(100vh - 80px)',
          zIndex: 2,
        }}
      >
        <Box
          display="flex"
          className={classes.content}
          style={{
            boxShadow: 'inset 0px 20px -20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {includeLeftPane && (
          <Box className={classes.leftPane}>
            <ScrollableSection className={classes.leftPaneScroll}>
              {leftPaneNodes}
            </ScrollableSection>
          </Box>
          )}
          <Box
            className={classes.mainContentPane}
            style={{
              width: getMainContentWidth(),
              paddingTop: !includeLeftPane ? 0 : undefined,
              boxShadow: includeRightPane ? 'rgba(0, 0, 0, 0.1) 20px 0px 20px -20px' : undefined,
            }}
          >
            <Box className={classes.mainContentContainer}>
              <ScrollableSection className={classes.mainContentScroll}>
                <Box className={clsx(classes.mainContentWrapper, classNames?.mainContent)}>
                  {mainContent}
                </Box>
              </ScrollableSection>
            </Box>
          </Box>
          {includeRightPane && (
            <Box
              className={classes.rightPane}
              style={{
                minWidth: rightPaneOpen ? '120px' : undefined,
                padding: !rightPaneOpen ? 0 : undefined,
              }}
            >
              <ExpandIconButton
                onClick={(): void => setRightPaneOpen(!rightPaneOpen)}
                reversed={!rightPaneOpen}
              >
                <ArrowRightIcon />
              </ExpandIconButton>
              <ScrollableSection className={classes.rightPaneScroll}>
                {rightPaneOpen && rightPaneNodes}
              </ScrollableSection>
            </Box>
          )}
        </Box>
      </ScrollableSection>
    </Box>
  );
}
