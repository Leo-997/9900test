import CustomAutocomplete from '@/components/Common/Autocomplete';
import {
  Box,
  Divider,
  Paper,
  PaperProps,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { useTherapyRecommendation } from '../../../../../../../contexts/TherapyRecommendationContext';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import {
  IDrugMetadata, IExternalDrug,
} from '../../../../../../../types/Drugs/Drugs.types';
import CustomButton from '../../../../../../Common/Button';
import CustomTypography from '../../../../../../Common/Typography';
import DrugDetailEditingModal from './DrugDetailEditingModal';
import DrugDetailSection from './DrugDetailSection';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  menuItem: {
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center',
    width: '260px',
    height: '48px',
  },
  autocompleteRoot: {
    height: '40px',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  },
  leftToggle: {
    height: '48px',
    width: '100%',
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
  },
  rightToggle: {
    height: '48px',
    width: '100%',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
  },
}));

export default function ActiveDrugPanel(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    updateActiveTherapyDrug,
    activeTherapyDrugIndex,
    selectedTherapyDrugs,
  } = useTherapyRecommendation();

  const [classOptions, setClassOptions] = useState<IDrugMetadata[]>([]);
  const [drugOptions, setDrugOptions] = useState<IExternalDrug[]>([]);

  const [openCreateDrugModal, setOpenCreateDrugModal] = useState<boolean>(false);

  const activeDrug = useMemo(
    () => (selectedTherapyDrugs[activeTherapyDrugIndex]?.drug ?? null),
    [activeTherapyDrugIndex, selectedTherapyDrugs],
  );
  const activeClass = useMemo(
    () => (selectedTherapyDrugs[activeTherapyDrugIndex]?.class ?? null),
    [activeTherapyDrugIndex, selectedTherapyDrugs],
  );

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

  const customPaper: React.FC<PaperProps> = ({
    children,
    ...props
  }) => (
    <Paper {...props}>
      {children}
      <CustomButton
        variant="text"
        label="Create a new drug"
        style={{ width: '100%', borderRadius: 0 }}
        onMouseDown={(): void => setOpenCreateDrugModal(true)}
      />
    </Paper>
  );

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        className={classes.root}
      >
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
              label="Drug Class"
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
              slots={{
                paper: customPaper,
              }}
            />
          </Box>
        </Box>
        {activeDrug ? (
          <DrugDetailSection
            drug={activeDrug}
            updateActiveTherapyDrugDetail={(updatedDrug: IExternalDrug): void => {
              updateActiveTherapyDrug({ drug: updatedDrug });
            }}
          />
        ) : (
          <Box height="142px" />
        )}
        <Divider style={{ marginTop: 'auto' }} />
      </Box>
      <DrugDetailEditingModal
        open={openCreateDrugModal}
        setOpen={setOpenCreateDrugModal}
        updateActiveDrugDetail={(updatedDrug: IExternalDrug): void => {
          updateActiveTherapyDrug({ drug: updatedDrug });
        }}
      />
    </>
  );
}
