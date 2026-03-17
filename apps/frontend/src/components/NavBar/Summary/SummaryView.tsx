import { makeStyles } from '@mui/styles';
import { useEffect, useState, type JSX } from 'react';
import PatientProfileTabContent from '@/components/CurationValidationTabs/PatientProfileTabContent';
import { SummaryDataProvider } from '../../../contexts/SummaryDataContext';
import { ItemSelectLayout } from '../../../layouts/FullScreenLayout/ItemSelectLayout';
import { SummaryTabs } from '../../../types/Summary/Summary.types';
import ReportsLeftPane from '../../Reports/Components/Navigation/ReportsLeftPane';
import SummaryTabContent from '../../SummaryView/SummaryTabContent';
import ReportsContent from '../Reports/ReportsContent';
import RightSideNavigation from '../RightSideNavigation';
import SummaryNavBar from './SummaryNavBar';

const useStyles = makeStyles(() => ({
  patientTab: {
    padding: '0 32px',
  },
}));

interface IProps {
  toggleExpandedView: (boolean: boolean) => void;
  handleClose: () => void;
  initialTab?: SummaryTabs;
}

export function SummaryView({
  toggleExpandedView,
  handleClose,
  initialTab = 'SUMMARY',
}: IProps): JSX.Element {
  const classes = useStyles();
  const [resourcesCategory, setResourcesCategory] = useState<SummaryTabs>(initialTab);

  useEffect(() => {
    toggleExpandedView(true);
  }, [toggleExpandedView]);

  return (
    <SummaryDataProvider>
      <ItemSelectLayout
        mainContent={(
          <>
            <div
              style={{
                display: resourcesCategory === 'SUMMARY' ? undefined : 'none',
                width: '100%',
              }}
            >
              <SummaryTabContent />
            </div>
            <div
              style={{
                display: resourcesCategory === 'PATIENT' ? undefined : 'none',
                width: '100%',
              }}
            >
              <PatientProfileTabContent className={classes.patientTab} />
            </div>
            {resourcesCategory === 'REPORTS' && (
              <ReportsContent />
            )}
          </>
        )}
        navBar={(
          <SummaryNavBar
            resourcesCategory={resourcesCategory}
            setResourcesCategory={setResourcesCategory}
            handleClose={handleClose}
          />
        )}
        leftPaneNodes={(
          <ReportsLeftPane />
        )}
        rightPaneNodes={(
          <RightSideNavigation isSummary key="summary-right-side-nav" />
        )}
        includeLeftPane={resourcesCategory === 'REPORTS'}
        includeRightPane
      />
    </SummaryDataProvider>
  );
}
