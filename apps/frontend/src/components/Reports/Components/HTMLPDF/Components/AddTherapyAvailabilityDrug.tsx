import CustomAutocomplete from '@/components/Common/Autocomplete';
import { Box } from '@mui/material';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IDrugMetadata, IExternalDrug } from '../../../../../types/Drugs/Drugs.types';
import CustomModal from '../../../../Common/CustomModal';
import CustomTypography from '../../../../Common/Typography';

interface IProps {
  open: boolean;
  onClose: () => void;
  selectedDrugs: string[];
  onSubmit: (drug: IExternalDrug) => void;
}

export default function AddTherapyAvailabilityDrug({
  open,
  onClose,
  selectedDrugs,
  onSubmit,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [classOptions, setClassOptions] = useState<IDrugMetadata[]>([]);
  const [drugOptions, setDrugOptions] = useState<IExternalDrug[]>([]);
  const [selectedClass, setSelectedClass] = useState<IDrugMetadata | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<IExternalDrug | null>(null);

  const updateClassOptions = useCallback(
    async (className = '') => {
      try {
        const resp = await zeroDashSdk.services.drugs.getDrugClasses({ className }, 1, 10);
        setClassOptions(resp);
      } catch (err) {
        setClassOptions([]);
      }
    },
    [zeroDashSdk.services.drugs],
  );

  const updateDrugOptions = useCallback(
    async (drugName = '') => {
      try {
        const resp = await zeroDashSdk.services.drugs.getDrugs({
          name: drugName,
          classes: selectedClass
            ? [selectedClass.id]
            : undefined,
        }, 1, 10);
        setDrugOptions(resp);
      } catch (err) {
        setDrugOptions([]);
      }
    },
    [selectedClass, zeroDashSdk.services.drugs],
  );

  useEffect(() => {
    updateClassOptions();
  }, [updateClassOptions]);

  useEffect(() => {
    updateDrugOptions();
  }, [updateDrugOptions]);

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Add drug"
      confirmDisabled={!selectedDrug}
      onConfirm={(): void => {
        if (selectedDrug) onSubmit(selectedDrug);
      }}
      content={(
        <Box>
          <CustomTypography>
            Select a drug to be added to the table.
            Selecting a class first will filter the drug options,
            but it is not required for submitting.
          </CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            width="50%"
            gap="16px"
            marginTop="16px"
            flexWrap="wrap"
          >
            <CustomAutocomplete
              label="Drug Class"
              id="get-drug-class-autocomplete"
              key={selectedClass?.id || 'new-drug-class'}
              options={classOptions}
              getOptionLabel={(option: IDrugMetadata): string => option.name || ''}
              defaultValue={selectedClass}
              getOptionDisabled={(option: IDrugMetadata): boolean => (
                selectedClass?.id === option.id
              )}
              onInputChange={(e, val): Promise<void> => updateClassOptions(val)}
              onChange={(e, val): void => setSelectedClass(val)}
              onFocus={(): Promise<void> => updateClassOptions('')}
              clearOnBlur
              wrapperSx={{ flex: 1 }}
            />
            <CustomAutocomplete
              label="Drug *"
              id="get-drug-autocomplete"
              key={selectedDrug?.versionId || 'new-drug'}
              options={drugOptions}
              getOptionLabel={(option): string => option.name || ''}
              value={selectedDrug}
              getOptionDisabled={(option): boolean => selectedDrugs.some(
                (externalVersionId) => externalVersionId === option.versionId,
              )}
              onChange={(e, val): void => setSelectedDrug(val)}
              onInputChange={(e, val): Promise<void> => updateDrugOptions(val)}
              onFocus={(): Promise<void> => updateDrugOptions('')}
              clearOnBlur
              wrapperSx={{ flex: 1 }}
            />
          </Box>
        </Box>
      )}
      variant="create"
      buttonText={{ confirm: 'Submit' }}
    />
  );
}
