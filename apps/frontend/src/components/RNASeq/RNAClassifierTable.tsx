import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { IRNAClassifierTable } from '@/types/RNAseq.types';
import { makeStyles } from '@mui/styles';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { CustomCheckbox } from '../Input/CustomCheckbox';

import type { JSX } from "react";

interface IProps {
  data: IRNAClassifierTable[];
  selectedPredictions: IRNAClassifierTable[];
  handleSelectPrediction: (
    promotedPrediction: IRNAClassifierTable,
  ) => Promise<void>;
}

const useStyles = makeStyles({
  container: {
    width: '100%',
  },
  tableContainer: {
    boxShadow: 'none',
  },
});

export default function RNAClassifierTable({
  data,
  selectedPredictions,
  handleSelectPrediction,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { isAssignedCurator } = useCuration();
  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
      alignItems="center"
      className={classes.container}
    >
      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Prediction</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const isSelected = selectedPredictions
                .map((p) => p.prediction)
                .includes(row.prediction);
              const predictionKey = row.predictionLabel
                ? 'predictionLabel'
                : 'prediction';

              return (
                <TableRow>
                  {index === 0 && selectedPredictions.length === 1
                    ? <div />
                    : (
                      <CustomCheckbox
                        labelProps={{ label: '' }}
                        checked={isSelected}
                        disabled={!canEditAssigned}
                        onClick={(): void => {
                          handleSelectPrediction({
                            ...row,
                            selectedPrediction: !isSelected,
                          });
                        }}
                      />
                    )}
                  {[predictionKey, 'score'].map((key) => (
                    <TableCell
                      key={key}
                      style={isSelected ? { fontWeight: 'bold' } : {}}
                    >
                      {typeof row[key] === 'string' ? row[key].replace(/_/g, ' ') : row[key]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
