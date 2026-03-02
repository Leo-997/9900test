import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { Box } from '@mui/material';
import CustomModal from '@/components/Common/CustomModal';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import CustomTypography from '@/components/Common/Typography';
import TherapyOption from '@/components/MTB/Views/Components/Modals/Components/Therapies/TherapyOption';
import { DrugListItem } from '@/components/MTB/Views/Components/Modals/Components/Therapies/DrugListItem';
import CustomButton from '@/components/Common/Button';
import { PlusIcon } from 'lucide-react';
import {
  IDrugMetadata, IEditTherapyDrug, IExternalDrug, IUpdateEditTherapyDrug,
} from '@/types/Drugs/Drugs.types';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import { v4 } from 'uuid';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import DrugDetailSection from '@/components/MTB/Views/Components/Modals/Components/Therapies/DrugDetailSection';
import { enqueueSnackbar } from 'notistack';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { CurationTherapyEntityTypes, ICurationTherapy } from '@/types/Therapies/CurationTherapies.types';
import { ITherapyOption } from '@/types/Therapies/CommonTherapies.types';

interface IProps {
  open: boolean;
  onClose: () => void;
  entityId: string | number;
  entityType: CurationTherapyEntityTypes;
  onSubmit: (newTherapy: ICurationTherapy) => void;
}

export default function LinkedTherapyModal({
  open,
  onClose,
  entityId,
  entityType,
  onSubmit,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    analysisSet,
  } = useAnalysisSet();

  const [chemotherapy, setChemotherapy] = useState<ITherapyOption>({
    includeOption: false,
    note: undefined,
  });
  const [radiotherapy, setRadiotherapy] = useState<ITherapyOption>({
    includeOption: false,
    note: undefined,
  });
  const [selectedTherapyDrugs, setSelectedTherapyDrugs] = useState<IEditTherapyDrug[]>([]);
  const [activeTherapyDrugIndex, setActiveTherapyDrugIndex] = useState<number>(-1);
  const [classOptions, setClassOptions] = useState<IDrugMetadata[]>([]);
  const [drugOptions, setDrugOptions] = useState<IExternalDrug[]>([]);

  const activeClass = useMemo(
    () => (selectedTherapyDrugs[activeTherapyDrugIndex]?.class ?? null),
    [activeTherapyDrugIndex, selectedTherapyDrugs],
  );
  const activeDrug = useMemo(
    () => (selectedTherapyDrugs[activeTherapyDrugIndex]?.drug ?? null),
    [activeTherapyDrugIndex, selectedTherapyDrugs],
  );

  const deleteTherapyDrug = useCallback((index): void => {
    const maxIndex = selectedTherapyDrugs.length - 1;
    setActiveTherapyDrugIndex((prev) => {
      if (index > prev) {
        return prev;
      }
      if (index === prev) {
        return index === maxIndex ? index - 1 : index;
      }
      return prev - 1;
    });
    setSelectedTherapyDrugs((prev) => prev.filter((d, i) => i !== index));
  }, [selectedTherapyDrugs.length]);

  const updateActiveTherapyDrug = useCallback((updatedFields: IUpdateEditTherapyDrug): void => {
    const newActiveTherapyDrug: IEditTherapyDrug = activeTherapyDrugIndex === -1
      ? {
        id: v4(),
        class: null,
        drug: null,
      } : selectedTherapyDrugs[activeTherapyDrugIndex];
    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] !== undefined) {
        newActiveTherapyDrug[key] = updatedFields[key];
      }
    });
    if (newActiveTherapyDrug.class === null && newActiveTherapyDrug.drug === null) {
      deleteTherapyDrug(activeTherapyDrugIndex);
      setActiveTherapyDrugIndex(-1);
      return;
    }
    setSelectedTherapyDrugs((prev) => {
      const newDrugs = [...prev];
      if (activeTherapyDrugIndex === -1) {
        newDrugs.push(newActiveTherapyDrug);
      } else {
        newDrugs[activeTherapyDrugIndex] = newActiveTherapyDrug;
      }
      return newDrugs;
    });
    setActiveTherapyDrugIndex((prev) => (prev === -1 ? selectedTherapyDrugs.length : prev));
  }, [activeTherapyDrugIndex, deleteTherapyDrug, selectedTherapyDrugs]);

  const updateClassOptions = useCallback(
    async () => {
      if (activeDrug) {
        setClassOptions(activeDrug.classes);
        return;
      }
      const resp = await zeroDashSdk.services.drugs.getDrugClasses({});
      setClassOptions(resp);
    },
    [activeDrug, zeroDashSdk.services.drugs],
  );

  const updateDrugOptions = useCallback(
    async () => {
      const resp = await zeroDashSdk.services.drugs.getDrugs({
        classes: activeClass
          ? [activeClass.id]
          : undefined,
        fetchAllVersions: false,
        isValidated: true,
      });
      setDrugOptions(resp);
    },
    [activeClass, zeroDashSdk.services.drugs],
  );

  useEffect(() => {
    updateClassOptions();
  }, [updateClassOptions]);

  useEffect(() => {
    updateDrugOptions();
  }, [updateDrugOptions]);

  const handleAddTherapy = async (): Promise<void> => {
    if (selectedTherapyDrugs.length > 0
      && selectedTherapyDrugs.every((d) => d.class && d.class.id)
    ) {
      try {
        const newTherapyId = await zeroDashSdk.curationTherapies.createTherapy({
          analysisSetId: analysisSet.analysisSetId,
          chemotherapy: chemotherapy.includeOption,
          chemotherapyNote: chemotherapy.note,
          radiotherapy: radiotherapy.includeOption,
          radiotherapyNote: radiotherapy.note,
          entityId,
          entityType,
          drugs: selectedTherapyDrugs.map((d) => ({
            externalDrugClassId: d.class?.id as string,
            externalDrugVersionId: d.drug?.versionId,
          })),
        });

        const newTherapy = await zeroDashSdk.curationTherapies.getTherapyById(newTherapyId);
        onSubmit(newTherapy);
        onClose();
      } catch {
        enqueueSnackbar('Error adding therapy, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <CustomModal
      title="Add therapy"
      open={open}
      onClose={onClose}
      buttonText={{ cancel: 'Close', confirm: 'Save' }}
      onConfirm={handleAddTherapy}
      confirmDisabled={
        !(selectedTherapyDrugs.length > 0)
        || !selectedTherapyDrugs.every((d) => d.class?.id)
      }
      tooltipText={!(selectedTherapyDrugs.length > 0)
        || !selectedTherapyDrugs.every((d) => d.class?.id)
        ? (
          <>
            You must have the following before submitting:
            <ul>
              <li>At least one drug class for each combination drug</li>
            </ul>
          </>
        )
        : ''}
      content={(
        <Box
          display="flex"
          gap="16px"
        >
          {/* LEFT PANEL */}
          <Box flex={1}>
            <ScrollableSection>
              <CustomTypography variant="titleRegular" fontWeight="medium">
                Therapy details
              </CustomTypography>
              <Box
                display="flex"
                flexDirection="column"
                gap="15px"
                marginTop="18px"
              >
                <TherapyOption
                  key="chemotherapy"
                  option={chemotherapy}
                  checkboxLabel="Chemotherapy"
                  onChange={setChemotherapy}
                />
                <TherapyOption
                  option={radiotherapy}
                  checkboxLabel="Radiotherapy"
                  onChange={setRadiotherapy}
                />
              </Box>
              <CustomTypography
                variant="titleRegular"
                fontWeight="medium"
                sx={{
                  display: 'block',
                  marginTop: '8px',
                }}
              >
                Drugs
              </CustomTypography>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                width="100%"
                gap="8px"
                marginTop="8px"
              >
                {selectedTherapyDrugs.map((therapyDrug, index) => (
                  <DrugListItem
                    key={therapyDrug.id}
                    isActive={index === activeTherapyDrugIndex}
                    drug={therapyDrug.drug}
                    drugClass={therapyDrug.class}
                    handleDelete={(): void => deleteTherapyDrug(index)}
                    handleClick={(): void => setActiveTherapyDrugIndex(index)}
                  />
                ))}
                {activeTherapyDrugIndex === -1 && (
                <DrugListItem
                  key="new"
                  isActive
                  drug={null}
                  drugClass={null}
                  handleClick={(): void => setActiveTherapyDrugIndex(-1)}
                />
                )}
                <CustomButton
                  label={`Add ${selectedTherapyDrugs.length > 0 ? 'combination ' : ''}drug`}
                  variant="subtle"
                  startIcon={<PlusIcon />}
                  style={{
                    marginTop: '8px',
                  }}
                  onClick={(): void => setActiveTherapyDrugIndex(-1)}
                  disabled={activeTherapyDrugIndex === -1}
                />
              </Box>
            </ScrollableSection>
          </Box>

          {/* RIGHT PANEL */}
          <Box flex={1}>
            <Box display="flex" alignItems="flex-end">
              <CustomTypography variant="titleRegular" fontWeight="medium">
                Add drug class for recommendation
              </CustomTypography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              gap="16px"
              flexWrap="wrap"
            >
              <Box
                display="flex"
                flexDirection="column"
                flex={1}
              >
                <CustomAutocomplete
                  label="Drug Class*"
                  options={classOptions}
                  getOptionLabel={(option: IDrugMetadata): string => option.name}
                  isOptionEqualToValue={(option: IDrugMetadata): boolean => (
                    activeClass?.id === option.id
                  )}
                  getOptionDisabled={(option: IDrugMetadata): boolean => (
                    activeClass?.id === option.id
                  )}
                  value={activeClass}
                  onChange={(event, newClass): void => {
                    updateActiveTherapyDrug({ class: newClass });
                  }}
                />
              </Box>
              <Box display="flex" flexDirection="column" justifyContent="flex-start" flex={1}>
                <CustomAutocomplete
                  label="Drug"
                  options={drugOptions}
                  getOptionLabel={(option: IExternalDrug): string => option.name}
                  isOptionEqualToValue={(option: IExternalDrug): boolean => (
                    activeDrug?.versionId === option.versionId
                  )}
                  getOptionDisabled={(option): boolean => selectedTherapyDrugs.some(
                    (therapyDrug) => therapyDrug.drug?.id === option.id,
                  )}
                  value={activeDrug}
                  onChange={(event, newDrug): void => {
                    updateActiveTherapyDrug({ drug: newDrug });
                  }}
                />
              </Box>
            </Box>
            {activeDrug ? (
              <Box marginTop="30px">
                <DrugDetailSection
                  drug={activeDrug}
                  isExpanded
                />
              </Box>
            ) : (
              <Box height="142px" />
            )}
          </Box>
        </Box>
      )}
    />
  );
}
