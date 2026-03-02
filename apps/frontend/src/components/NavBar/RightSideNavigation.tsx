import { Box, styled } from '@mui/material';
import { useCallback, useState, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CircosView from './Circos/CircosView';
import IGVModal from './IGV/IGVModal';
import LibraryView from './Library/LibraryView';
import LinxView from './Linx/LinxView';
import NavDrawer from './NavDrawer';
import NavIconList from './NavIconList';
import { SummaryView } from './Summary/SummaryView';

interface IRightNavProps {
  isSummary: boolean;
}

const Container = styled(Box)<IRightNavProps>(({ isSummary }) => ({
  width: isSummary ? 'auto' : '121px',
  height: '100%',
}));

export default function RightSideNavigation({
  isSummary,
}: IRightNavProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedView, setExpandedView] = useState(false);
  const [isDock, setIsDock] = useState<boolean>(false);
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const [drawerType, setDrawerType] = useState<string>('');
  const [igvModalOpen, setIgvModalOpen] = useState<boolean>(false);

  // Modal | Drawer title bar functionalies
  const handleOpen = useCallback((type: string): void => {
    setIsExpand(true);
    setDrawerType(type);
    if (type === 'IGV') setIgvModalOpen(true);
  }, []);

  const handleClose = (): void => {
    setIsExpand(false);
    setIgvModalOpen(false);
    setIsDock(false);
    setExpandedView(false);
    setDrawerType('');
    const params = new URLSearchParams(location.search);
    params.delete('navBar');
    const newURL = `${location.pathname}${params.toString()}`;
    if (!isSummary) {
      navigate(newURL);
    }
  };

  const getSummaryReportView = (type: 'SUMMARY' | 'REPORTS'): JSX.Element => (
    <SummaryView
      toggleExpandedView={setExpandedView}
      handleClose={handleClose}
      initialTab={type}
    />
  );

  const libraryView = (
    <LibraryView
      expandedView={expandedView}
      isDock={isDock}
      toggleExpandedView={setExpandedView}
      handleClose={handleClose}
      toggleDock={setIsDock}
    />
  );

  const circosView = (
    <CircosView
      expandedView={expandedView}
      isDock={isDock}
      toggleExpandedView={setExpandedView}
      handleClose={handleClose}
      toggleDock={setIsDock}
    />
  );

  const linxView = (
    <LinxView
      expandedView={expandedView}
      isDock={isDock}
      toggleExpandedView={setExpandedView}
      handleClose={handleClose}
      toggleDock={setIsDock}
    />
  );

  const setDrawerTypeView = (type: string): JSX.Element | null => {
    switch (type) {
      case 'CIRCOS':
        return circosView;
      case 'SUMMARY':
      case 'REPORTS':
        return getSummaryReportView(type);
      case 'LINX':
        return linxView;
      case 'IGV':
        setIgvModalOpen(true);
        return null;
      case 'LIBRARY':
        return libraryView;
      default:
        return <div />;
    }
  };

  return (
    <Container isSummary={isSummary}>
      <NavIconList
        handleOpen={handleOpen}
        isSummary={isSummary}
        drawerType={drawerType}
      />

      {drawerType !== 'IGV' && (
        <NavDrawer
          isDock={isDock}
          isExpand={isExpand}
          expandedView={expandedView}
          handleClose={handleClose}
          DrawerContent={setDrawerTypeView(drawerType) ?? <div />}
        />
      )}
      <IGVModal
        open={igvModalOpen}
        closeModal={handleClose}
      />
    </Container>
  );
}
