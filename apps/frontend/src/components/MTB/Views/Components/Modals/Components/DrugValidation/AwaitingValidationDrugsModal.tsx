import CustomTypography from '@/components/Common/Typography';
import NavBar from '@/components/MTB/NavBar/Modal/NavBar';
import { ItemSelectLayout } from '@/layouts/FullScreenLayout/ItemSelectLayout';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import {
  Box,
  Dialog,
} from '@mui/material';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX } from 'react';
import CustomButton from '@/components/Common/Button';
import DrugListItemChip from '../Therapies/DrugListItemChip';
import { DrugDetailGrid } from '../Therapies/DrugDetailGrid';
import AwaitingValidationSection from './AwaitingValidationSection';
import DrugDetailEditingModal from '../Therapies/DrugDetailEditingModal';

interface IProps {
  unvalidatedDrugs: IExternalDrug[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  readonly?: boolean;
  onClose?: () => void;
}

export default function AwaitingValidationDrugsModal({
  unvalidatedDrugs,
  open,
  setOpen,
  readonly = false,
  onClose,
}: IProps): JSX.Element {
  const [drugs, setDrugs] = useState<IExternalDrug[]>(unvalidatedDrugs);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [openEditingModal, setOpenEditingModal] = useState<boolean>(false);

  const removeActiveDrug = useCallback(() => {
    const newActiveIndex = activeIndex === drugs.length - 1
      ? activeIndex - 1
      : activeIndex;
    setDrugs((prev) => prev.filter((d, i) => i !== activeIndex));
    setActiveIndex(newActiveIndex);
  }, [activeIndex, drugs.length]);

  const updateActiveDrug = useCallback((updatedDrug: IExternalDrug) => {
    setDrugs((prev) => {
      const newDrugs = [...prev];
      newDrugs[activeIndex] = updatedDrug;
      return newDrugs;
    });
  }, [activeIndex]);

  useEffect(() => {
    setDrugs(unvalidatedDrugs);
  }, [unvalidatedDrugs]);

  return (
    <Dialog
      fullScreen
      fullWidth
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: '100vw',
            maxWidth: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            borderRadius: 0,
          },
        },
      }}
    >
      <ItemSelectLayout
        navBar={(
          <NavBar
            returnFn={(): void => {
              onClose?.();
              setOpen(false);
            }}
          />
        )}
        mainContent={(
          drugs[activeIndex] ? (
            <Box width="90%">
              <Box
                display="flex"
                flexDirection="column"
                height="auto"
                bgcolor="#FFFFFF"
                padding="24px 32px"
                borderRadius="10px"
                gap="24px"
              >
                <CustomTypography
                  variant="h4"
                  fontWeight="medium"
                >
                  {drugs[activeIndex].name}
                </CustomTypography>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="20px"
                >
                  {!readonly && (
                    <AwaitingValidationSection
                      drug={drugs[activeIndex]}
                      removeActiveDrug={removeActiveDrug}
                    />
                  )}
                  <DrugDetailGrid drug={drugs[activeIndex]} />
                </Box>
                {!readonly && (
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    height="48px"
                  >
                    <CustomButton
                      variant="bold"
                      label="Edit details"
                      size="small"
                      onClick={(): void => setOpenEditingModal(true)}
                    />
                  </Box>
                )}
              </Box>
              {openEditingModal && (
                <DrugDetailEditingModal
                  open={openEditingModal}
                  setOpen={setOpenEditingModal}
                  updateActiveDrugDetail={updateActiveDrug}
                  existingDrug={drugs[activeIndex]}
                />
              )}
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              margin="auto"
            >
              <CustomTypography variant="h3">
                No drugs awaiting approval for this sample.
              </CustomTypography>
            </Box>
          ))}
        leftPaneNodes={(
          <Box
            display="flex"
            flexDirection="column"
            gap="16px"
            padding="3px"
          >
            {drugs.map((drug, index) => (
              <DrugListItemChip
                key={drug.versionId}
                isActive={index === activeIndex}
                drug={drug}
                drugClass={null}
                showAwaitingValidationChip={false}
                handleClick={(): void => setActiveIndex(index)}
              />
            ))}
          </Box>
        )}
        includeLeftPane={drugs.length !== 0}
      />
    </Dialog>
  );
}
