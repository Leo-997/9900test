import { Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useCallback, useMemo, useState, type JSX,
} from 'react';
import { corePalette } from '@/themes/colours';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { leukeamiaSubtypeOptions } from '@/constants/Curation/MolecularConfirmation';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { ILeukemiaSubtypes, LeukeamiaSubtypeOption } from '@/types/MolecularConfirmation.types';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import CustomTypography from '../Common/Typography';
import CustomButton from '../Common/Button';
import CustomAutocomplete from '../Common/Autocomplete';

interface IProps {
  leukemiaSubtypes: ILeukemiaSubtypes,
}

export default function LeukemiaSubtyping({
  leukemiaSubtypes,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { setLeukemiaSubtypes, analysisSet } = useAnalysisSet();
  const canEdit = useIsUserAuthorised('curation.sample.write');

  const [
    newLeukemiaSubtypes,
    setNewLeukemiaSubtypes,
  ] = useState<ILeukemiaSubtypes>({ ...leukemiaSubtypes });
  const hasUpdate = useMemo(
    () => Object.entries(leukemiaSubtypes).some(([k, v]) => (newLeukemiaSubtypes[k] !== v)),
    [leukemiaSubtypes, newLeukemiaSubtypes],
  );

  const handleSave = useCallback((): void => {
    zeroDashSdk.curation.molecularConfirmation
      .updateMolecularConfirmation(newLeukemiaSubtypes, analysisSet.analysisSetId)
      .then(() => setLeukemiaSubtypes({ ...newLeukemiaSubtypes }))
      .catch(() => enqueueSnackbar('Cannot update leukemia subtyping, please try again.', { variant: 'error' }));
  }, [
    analysisSet.analysisSetId,
    enqueueSnackbar,
    newLeukemiaSubtypes,
    setLeukemiaSubtypes,
    zeroDashSdk.curation.molecularConfirmation,
  ]);

  return (
    <Grid
      container
      direction="column"
      bgcolor={corePalette.white}
      padding="24px"
      borderRadius="8px"
      spacing={3}
      size={12}
    >
      <CustomTypography variant="titleRegular" fontWeight="medium">
        Leukemia Subtyping
      </CustomTypography>
      <Grid
        container
        direction="column"
        spacing={1}
      >
        <CustomTypography variant="titleSmall" fontWeight="medium">
          Subtype at diagnosis
        </CustomTypography>
        <CustomAutocomplete
          options={leukeamiaSubtypeOptions}
          value={newLeukemiaSubtypes.diagnosisSubtype ?? ''}
          onChange={(e, value): void => setNewLeukemiaSubtypes((prev) => ({
            ...prev,
            diagnosisSubtype: value as LeukeamiaSubtypeOption || null,
          }))}
          disabled={!canEdit}
          sx={{ width: '300px' }}
        />
      </Grid>
      <Grid
        container
        direction="column"
        spacing={1}
      >
        <CustomTypography variant="titleSmall" fontWeight="medium">
          ZERO2 confirmed subtype
        </CustomTypography>
        <CustomAutocomplete
          options={leukeamiaSubtypeOptions}
          value={newLeukemiaSubtypes.zero2ConfirmedSubtype ?? ''}
          onChange={(e, value): void => setNewLeukemiaSubtypes((prev) => ({
            ...prev,
            zero2ConfirmedSubtype: value as LeukeamiaSubtypeOption || null,
          }))}
          disabled={!canEdit}
          sx={{ width: '300px' }}
        />
      </Grid>
      {hasUpdate && (
        <Grid
          container
          direction="row"
          gap="16px"
          marginBottom="-12px"
          justifyContent="flex-end"
        >
          <CustomButton
            label="Cancel"
            variant="subtle"
            size="small"
            onClick={(): void => setNewLeukemiaSubtypes({ ...leukemiaSubtypes })}
          />
          <CustomButton
            label="Save"
            variant="bold"
            size="small"
            onClick={handleSave}
          />
        </Grid>
      )}
    </Grid>
  );
}
