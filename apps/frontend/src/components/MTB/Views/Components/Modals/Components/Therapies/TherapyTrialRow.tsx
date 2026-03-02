import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomOutlinedInput from '@/components/Common/Input';
import { IExternalTrial, ITherapyTrial } from '@/types/Drugs/Trials.types';
import { Grid, IconButton } from '@mui/material';
import { Trash2Icon } from 'lucide-react';

import type { JSX } from "react";

interface IProps {
  trial: ITherapyTrial;
  draftTherapyTrials: ITherapyTrial[];
  allTrialOptions: IExternalTrial[];
  onChange: (newTrial: ITherapyTrial) => void;
  onDelete: () => void;
}

export function TherapyTrialRow({
  trial,
  draftTherapyTrials,
  allTrialOptions,
  onChange,
  onDelete,
}: IProps): JSX.Element {
  return (
    <Grid container spacing="8px" alignItems="flex-end">
      <Grid size={3}>
        <CustomAutocomplete
          label="NCT Number *"
          options={allTrialOptions}
          getOptionLabel={(o): string => {
            if (!o || typeof o === 'string') return o;
            return `${o.trialId} - ${o.name}`;
          }}
          getOptionDisabled={(option: IExternalTrial): boolean => draftTherapyTrials.some(
            (draftTherapyTrial) => draftTherapyTrial.externalTrial.id === option.id,
          )}
          isOptionEqualToValue={(option, value): boolean => option.id === value.id}
          onChange={(e, v): void => {
            if (!v || typeof v === 'string') {
              const externalTrial = allTrialOptions.find((t) => t.trialId === v) ?? null;
              // free solo entry
              onChange({
                ...trial,
                externalTrial: {
                  id: externalTrial?.id ?? '',
                  name: externalTrial?.name ?? '',
                  trialId: externalTrial?.trialId ?? v ?? '',
                },
              });
            } else {
              // selected one of the options
              onChange({
                ...trial,
                externalTrial: {
                  id: v.id,
                  name: v.name,
                  trialId: v.trialId,
                },
              });
            }
          }}
          value={allTrialOptions.find((t) => t.id === trial.externalTrial.id) ?? null}
          freeSolo
          autoSelect
          blurOnSelect
        />
      </Grid>
      <Grid size={3}>
        <CustomOutlinedInput
          label="Trial Name *"
          value={trial.externalTrial.name ?? ''}
          onChange={(e): void => {
            onChange({
              ...trial,
              externalTrial: {
                ...trial.externalTrial,
                name: e.target.value,
              },
            });
          }}
        />
      </Grid>
      <Grid size={5}>
        <CustomOutlinedInput
          label="Description"
          value={trial.note ?? undefined}
          onChange={(e): void => {
            onChange({
              ...trial,
              note: e.target.value?.trim() === '' ? undefined : e.target.value,
            });
          }}
        />
      </Grid>
      <Grid size={1}>
        <IconButton onClick={onDelete}>
          <Trash2Icon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
