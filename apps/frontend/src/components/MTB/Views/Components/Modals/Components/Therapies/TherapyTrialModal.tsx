import CustomModal from '@/components/Common/CustomModal';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import {
  Box,
  Divider as MuiDivider,
  styled,
} from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { IExternalTrial, ITherapyTrial } from '@/types/Drugs/Trials.types';
import { v4 } from 'uuid';
import { useTherapyRecommendation } from '@/contexts/TherapyRecommendationContext';
import CustomButton from '../../../../../../Common/Button';
import { TherapyTrialRow } from './TherapyTrialRow';

const Divider = styled(MuiDivider)(({ theme }) => ({
  color: theme.colours.core.grey10,
  margin: '8px 0px',
}));

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function TherapyTrialModal({
  open,
  setOpen,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    selectedTherapyTrials,
    setSelectedTherapyTrials,
  } = useTherapyRecommendation();

  const emptyTrial: ITherapyTrial = {
    id: v4(),
    externalTrial: {
      id: v4(),
      name: '',
      trialId: '',
    },
    note: undefined,
  };

  const [draftTherapyTrials, setDraftTherapyTrials] = useState<ITherapyTrial[]>(
    selectedTherapyTrials.length > 0
      ? selectedTherapyTrials
      : [emptyTrial],
  );

  const [allTrialOptions, setAllTrialOptions] = useState<IExternalTrial[]>([]);

  useEffect(() => {
    zeroDashSdk.services.drugs.getExternalTrials()
      .then((resp) => setAllTrialOptions(resp));
  }, [zeroDashSdk.services.drugs]);

  return (
    <CustomModal
      open={open}
      onClose={(): void => setOpen(false)}
      title="Add clinical trials"
      content={(
        <>
          {draftTherapyTrials.map((draftTherapyTrial) => (
            <TherapyTrialRow
              key={draftTherapyTrial.id}
              trial={draftTherapyTrial}
              draftTherapyTrials={draftTherapyTrials}
              allTrialOptions={allTrialOptions}
              onChange={(newTrial): void => setDraftTherapyTrials(
                (prev) => prev.map((t) => (
                  t.id === newTrial.id ? newTrial : t
                )),
              )}
              onDelete={(): void => {
                setDraftTherapyTrials((prev) => {
                  const newTrials = prev.filter((t) => t.id !== draftTherapyTrial.id);
                  if (newTrials.length === 0) {
                    newTrials.push(emptyTrial);
                  }
                  return newTrials;
                });
              }}
            />
          ))}
          <Divider />
          <Box>
            <CustomButton
              variant="text"
              label="Add trial"
              startIcon={<PlusIcon />}
              disabled={draftTherapyTrials.some((t) => t.externalTrial.name === '' || t.externalTrial.trialId === '')}
              onClick={(): void => {
                setDraftTherapyTrials((prev) => [...prev, emptyTrial]);
              }}
            />
          </Box>
        </>
      )}
      confirmDisabled={draftTherapyTrials.some((t) => t.externalTrial.name === '' || t.externalTrial.trialId === '')}
      onConfirm={async (): Promise<void> => {
        const newDraftTherapyTrials: ITherapyTrial[] = await Promise.all(
          draftTherapyTrials.map(async ({ id, note, externalTrial }) => {
            const newExternalTrial = await zeroDashSdk.services.drugs.upsertExternalTrial({
              trialId: externalTrial.trialId,
              name: externalTrial.name,
            });
            return {
              id,
              note,
              externalTrial: newExternalTrial,
            };
          }),
        );
        setSelectedTherapyTrials(newDraftTherapyTrials);
        setOpen(false);
      }}
      onSecondary={(): void => {
        setSelectedTherapyTrials([]);
        setOpen(false);
      }}
      buttonText={{
        secondary: 'Clear all',
      }}
      showActions={{
        confirm: true,
        cancel: true,
        secondary: true,
      }}
      secondaryVariant="alert"
    />
  );
}
