import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import clsx from 'clsx';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import ClinicalHistory from '../PatientProfile/ClinicalHistory';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import PatientDetails from '../PatientProfile/PatientDetails';
import MolecularConfirmation from '../PatientProfile/MolecularConfirmation';
import LeukemiaSubtyping from '../PatientProfile/LeukeamiaSubtyping';

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '100%',
    overflowY: 'auto',
    overflowX: 'auto',
    maxHeight: 'calc(100vh - 160px)',
  },
}));

interface IProps {
  className?: string;
}

export default function PatientProfileTabContent({
  className = '',
}: IProps): JSX.Element {
  const classes = useStyles();
  const { analysisSet, molecularConfirmation, leukemiaSubtypes } = useAnalysisSet();
  return (
    <ScrollableSection className={clsx(classes.wrapper, className)}>
      <Grid container direction="column" spacing={2}>
        <PatientDetails />
        <ClinicalHistory />
        {leukemiaSubtypes && analysisSet.zero2Subcategory1 === 'Leukaemia' && (
          <LeukemiaSubtyping
            leukemiaSubtypes={leukemiaSubtypes}
          />
        )}
        {molecularConfirmation && (
          <MolecularConfirmation
            molecularConfirmation={molecularConfirmation}
          />
        )}
      </Grid>
    </ScrollableSection>
  );
}
