import { Box } from '@mui/material';
import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { InfoIcon } from 'lucide-react';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import CustomTypography from '@/components/Common/Typography';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { DiagnosisInput, DiagnosisOptionCombination } from '../../../../../../../types/MTB/Recommendation.types';

interface IProps {
  diagnosisInput: DiagnosisInput;
  setDiagnosisInput: Dispatch<SetStateAction<DiagnosisInput>>;
  updatePrefilling: (zero2FinalDiagnosis: string | undefined) => void ;
}

export default function DiagnosisInputSection({
  diagnosisInput,
  setDiagnosisInput,
  updatePrefilling,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [
    diagnosisOptionCombinations,
    setDiagnosisOptionCombinations,
  ] = useState<DiagnosisOptionCombination[]>([]);

  const filteredOptionCombinations = useMemo(
    () => diagnosisOptionCombinations.filter(
      (c) => Object.keys(diagnosisInput).every(
        (key) => !diagnosisInput[key] || c[key] === diagnosisInput[key],
      ),
    ),
    [diagnosisInput, diagnosisOptionCombinations],
  );

  const zero2CategoryOptions = useMemo(
    () => Array
      .from(new Set(filteredOptionCombinations.map((c) => c.zero2Category)))
      .sort((a, b) => a.localeCompare(b)),
    [filteredOptionCombinations],
  );

  const zero2Subcat1Options = useMemo(
    () => Array
      .from(new Set(filteredOptionCombinations.map((c) => c.zero2Subcat1)))
      .sort((a, b) => a.localeCompare(b)),
    [filteredOptionCombinations],
  );

  const zero2Subcat2Options = useMemo(
    () => Array
      .from(new Set(filteredOptionCombinations.map((c) => c.zero2Subcat2)))
      .sort((a, b) => a.localeCompare(b)),
    [filteredOptionCombinations],
  );

  const zero2FinalDiagnosisOptions = useMemo(
    () => Array
      .from(new Set(filteredOptionCombinations.map((c) => c.zero2FinalDiagnosis)))
      .sort((a, b) => a.localeCompare(b)),
    [filteredOptionCombinations],
  );

  const handleSelectOption = (
    field: keyof DiagnosisInput,
    val: string | undefined,
  ): void => {
    const newDiagnosisInput: DiagnosisInput = { [field]: val };
    // only autofill other inputs when select non-empty value to prevent infinite autofill
    if (val) {
      if (field !== 'zero2Category' && zero2CategoryOptions.length === 1) {
        [newDiagnosisInput.zero2Category] = zero2CategoryOptions;
      }
      if (field !== 'zero2Subcat1' && zero2Subcat1Options.length === 1) {
        [newDiagnosisInput.zero2Subcat1] = zero2Subcat1Options;
      }
      if (field !== 'zero2Subcat2' && zero2Subcat2Options.length === 1) {
        [newDiagnosisInput.zero2Subcat2] = zero2Subcat2Options;
      }
      if (field !== 'zero2FinalDiagnosis' && zero2FinalDiagnosisOptions.length === 1) {
        [newDiagnosisInput.zero2FinalDiagnosis] = zero2FinalDiagnosisOptions;
      }
    }
    setDiagnosisInput((prev) => ({
      ...prev,
      ...newDiagnosisInput,
    }));
    if (newDiagnosisInput.zero2FinalDiagnosis) {
      updatePrefilling(newDiagnosisInput.zero2FinalDiagnosis);
    }
  };

  useEffect(() => {
    zeroDashSdk
      .curation
      .analysisSets
      .getZero2DiagnosisOptionCombinations()
      .then(setDiagnosisOptionCombinations);
  }, [zeroDashSdk.curation.analysisSets]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      bgcolor={corePalette.grey10}
      padding="24px"
      borderRadius="8px"
      gap="24px"
    >
      <Box
        display="flex"
        width="100%"
        gap="16px"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap="8px"
          width="33%"
        >
          <CustomTypography variant="label">
            Zero2 Category
          </CustomTypography>
          <CustomAutocomplete
            options={zero2CategoryOptions}
            value={diagnosisInput.zero2Category ?? ''}
            onChange={(e, val): void => handleSelectOption('zero2Category', val ?? undefined)}
            clearOnBlur
            fullWidth
          />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap="8px"
          width="33%"
        >
          <CustomTypography variant="label">
            Zero2 Subcategory 1
          </CustomTypography>
          <CustomAutocomplete
            options={zero2Subcat1Options}
            value={diagnosisInput.zero2Subcat1 ?? ''}
            onChange={(e, val): void => handleSelectOption('zero2Subcat1', val ?? undefined)}
            clearOnBlur
            fullWidth
          />
        </Box>
      </Box>
      <Box
        display="flex"
        width="100%"
        gap="16px"
      >

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap="8px"
          width="33%"
        >
          <CustomTypography variant="label">
            Zero2 Subcategory 2
          </CustomTypography>
          <CustomAutocomplete
            options={zero2Subcat2Options}
            value={diagnosisInput.zero2Subcat2 ?? ''}
            onChange={(e, val): void => handleSelectOption('zero2Subcat2', val ?? undefined)}
            clearOnBlur
            fullWidth
          />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap="8px"
          width="33%"
        >
          <CustomTypography variant="label">
            Zero2 Final Diagnosis
          </CustomTypography>
          <CustomAutocomplete
            options={zero2FinalDiagnosisOptions}
            value={diagnosisInput.zero2FinalDiagnosis ?? ''}
            onChange={(e, val): void => handleSelectOption('zero2FinalDiagnosis', val ?? undefined)}
            clearOnBlur
            fullWidth
          />
        </Box>
      </Box>
      {Object.values(diagnosisInput).some((v) => v === undefined) && (
        <Box
          display="flex"
          flexDirection="row"
          borderRadius="8px"
          padding="12px"
          bgcolor={corePalette.blue10}
          gap="8px"
        >
          <InfoIcon color={corePalette.blue300} />
          <CustomTypography variant="bodyRegular" color={corePalette.blue300}>
            Please select ZERO2 CATEGORY, SUBCATEGORY 1 and SUBCATEGORY 2 inputs
          </CustomTypography>
        </Box>
      )}
    </Box>
  );
}
