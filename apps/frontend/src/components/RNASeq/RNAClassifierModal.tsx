import {
  Box,
  Divider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { yesNoOptions } from '@/constants/options';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { corePalette } from '@/themes/colours';
import { IRNAClassifierTable, IUpdateRNAClassifier } from '@/types/RNAseq.types';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import DataPanel from '../Common/DataPanel';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import RNAClassifierTable from './RNAClassifierTable';

const useStyles = makeStyles(() => ({
  wrapper: {
    gap: '10px',
    width: '100%',
  },
}));

interface IRNAClassifierModalProps {
  data: IRNAClassifierTable[];
  selectedPredictions: IRNAClassifierTable[];
  handleSelectPrediction: (promotedClassifier: IRNAClassifierTable) => Promise<void>;
  handleUpdateResult: (body: IUpdateRNAClassifier) => Promise<void>;
}

export default function RNAClassifierModal({
  data,
  selectedPredictions,
  handleSelectPrediction,
  handleUpdateResult,
}: IRNAClassifierModalProps): JSX.Element {
  const classes = useStyles();
  const { rnaBiosample } = useAnalysisSet();
  const { isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(selectedPredictions?.[0]?.researchCandidate),
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      className={classes.wrapper}
    >
      <DataPanel
        label="Research candidate"
        value={(
          <AutoWidthSelect
            options={yesNoOptions}
            overrideReadonlyMode={isReadOnly || !canEdit}
            value={researchCandidate}
            onChange={(event): void => {
              const newValue = event.target.value as string;
              setResearchCandidate(newValue);
              handleUpdateResult({ researchCandidate: strToBool(newValue) });
            }}
            defaultValue={boolToStr(selectedPredictions?.[0]?.researchCandidate)}
          />
        )}
      />
      <Divider
        sx={{
          border: 'none',
          borderTop: `1px solid ${corePalette.grey50}`,
          width: '100%',
          margin: 0,
        }}
      />
      <ScrollableSection style={{ width: '100%' }}>
        <RNAClassifierTable
          data={data}
          selectedPredictions={selectedPredictions}
          handleSelectPrediction={handleSelectPrediction}
        />
      </ScrollableSection>
    </Box>
  );
}
