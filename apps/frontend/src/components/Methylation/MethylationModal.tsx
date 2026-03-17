import React, { useState, type JSX } from 'react';

import {
    Divider,
    Grid,
    SelectChangeEvent,
    styled,
} from '@mui/material';

import { yesNoOptions } from '@/constants/options';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import CustomTypography from '../Common/Typography';

import { IMethylationData } from '../../types/Methylation.types';

import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import DataPanel from '../Common/DataPanel';
import OutlinedInput from '../Input/OutlinedTextInput';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const Row = styled(Grid)(() => ({
  padding: '8px 0px',
}));

const useStyles = makeStyles(() => ({
  rowItem: {
    paddingRight: '20px',
  },
  inputContainer: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& div': {
      marginBottom: '0px !important',
    },
  },
}));

interface IMethylationModalProps {
  data: IMethylationData;
}

export default function MethylationModal({
  data,
}: IMethylationModalProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: data?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();
  const {
    methBiosample,
  } = useAnalysisSet();

  const [score, setScore] = useState<number>(data.score);
  const [interpretation, setInterpretation] = useState<string>(data.interpretation);
  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(data.researchCandidate),
  );

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleInterpretationChange = async (
    event: SelectChangeEvent<unknown>,
  ): Promise<void> => {
    if (methBiosample?.biosampleId) {
      await zeroDashSdk.methylation.updateMethylationByGroupId(
        { interpretation: event.target.value as string },
        methBiosample.biosampleId,
        data.groupId,
      );
      setInterpretation(event.target.value as string);
    }
  };

  const handleScoreChange = async (
    event: React.ChangeEvent<{
      name?: string | number | undefined;
      value: unknown;
    }>,
  ): Promise<void> => {
    if (methBiosample?.biosampleId) {
      setScore(parseFloat(event.target.value as string));
    }
  };

  const handleUpdate = async (newData: Partial<IMethylationData>): Promise<void> => {
    if (methBiosample?.biosampleId) {
      try {
        await zeroDashSdk.methylation.updateMethylationByGroupId(
          newData,
          methBiosample.biosampleId,
          data.groupId,
        );
        enqueueSnackbar('Methylation data has been updated.', { variant: 'success' });
      } catch {
        enqueueSnackbar('There was an issue updating methylation data.', { variant: 'error' });
      }
    }
  };

  return (
    <Grid container direction="column">
      <Row container>
        <Grid size={{ xs: 12, lg: 6 }} className={classes.rowItem}>
          <DataPanel
            label="Classifier Version"
            value={`${data.classifierName} version ${data.version}`}
          />
        </Grid>
        <Grid container size={{ xs: 12, lg: 6 }} className={classes.rowItem}>
          <Grid>
            <DataPanel
              label="METHYLATION CLASS"
              value={data
                && data.groupName[0]
                && data.groupName[0].toUpperCase() + data.groupName.substring(1)}
            />
          </Grid>
        </Grid>
        <Grid container size={{ xs: 12, lg: 6 }} direction="column" className={classes.rowItem} style={{ paddingTop: '12px' }}>
          <DataPanel
            label="EPIC ARRAY VERSION"
            value={data.chipVersion ?? 'N/A'}
          />
        </Grid>
        <Grid container size={{ xs: 12, lg: 6 }} direction="column" className={classes.rowItem} style={{ paddingTop: '12px' }}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                overrideReadonlyMode={isReadOnly || !canEditAllCurators}
                value={researchCandidate}
                onChange={(e): void => {
                  setResearchCandidate(e.target.value as string);
                  handleUpdate({ researchCandidate: strToBool(e.target.value as string) });
                }}
                defaultValue={boolToStr(data.researchCandidate)}
              />
            )}
          />
        </Grid>
      </Row>
      <Divider variant="fullWidth" />
      <Row container>
        <Grid size={{ xs: 12, lg: 6 }} className={classes.rowItem}>
          <DataPanel
            label="CALIBRATED SCORE"
            value={(
              <OutlinedInput
                disabled={isReadOnly || !canEditAssigned}
                type="number"
                value={score}
                name="score"
                onChange={handleScoreChange}
                onBlur={(e): Promise<void> => handleUpdate({ score: parseFloat(e.target.value) })}
                inputContainerClassName={classes.inputContainer}
                style={{ height: '40px', maxWidth: '160px' }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Grid container direction="column">
            <DataPanel
              label="INTERPRETATION"
              value={(
                <AutoWidthSelect
                  key="interpretation-label"
                  options={[
                    { value: 'None', name: 'None' },
                    { value: 'MATCH', name: 'MATCH' },
                    { value: 'NO MATCH', name: 'NO MATCH' },
                  ]}
                  overrideReadonlyMode={!canEditAssigned || isReadOnly}
                  value={interpretation}
                  name="interpretation"
                  defaultValue="None"
                  onChange={handleInterpretationChange}
                />
              )}
            />
          </Grid>
        </Grid>
      </Row>
      <Divider variant="fullWidth" />
      <Row container>
        <Grid size={{ xs: 12 }}>
          <DataPanel
            label="CLASS ID"
            value={data.classId}
          />
        </Grid>
      </Row>
      <Divider variant="fullWidth" />
      <Row container>
        <CustomTypography variant="label">DESCRIPTION</CustomTypography>
        <CustomTypography variant="bodyRegular" style={{ paddingBottom: '24px' }}>
          {data.description}
        </CustomTypography>
      </Row>
    </Grid>
  );
}
