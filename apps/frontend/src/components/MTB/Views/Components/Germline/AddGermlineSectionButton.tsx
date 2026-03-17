import { useState, type JSX } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { getGermlineSectionInitialContent } from '@/constants/Clinical/germline';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ChevronDownIcon } from 'lucide-react';
import CustomButton from '../../../../Common/Button';
import { germlineSectionOptions } from '../../../../../constants/options';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { GermlineSectionType, ISlideSection } from '../../../../../types/MTB/Slide.types';
import { initialClinicalInformation } from '../../../../../constants/clinicalInfo';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';

export default function AddGermlineSectionButton(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    isReadOnly,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    clinicalInfo,
    setClinicalInfo,
    germlineSections,
    setGermlineSections,
  } = useActiveSlide();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const canCreateSection = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  async function createSlideSection(
    sectionData: Pick<ISlideSection, 'order' | 'type' | 'name' | 'description'>,
  ): Promise<void> {
    if (slide) {
      const resp = await zeroDashSdk.mtb.slides.createSlideSection(
        clinicalVersion.id,
        slide.id,
        sectionData,
      );
      setGermlineSections((prev) => ([
        ...prev,
        {
          id: resp,
          slideId: slide.id,
          description: getGermlineSectionInitialContent(sectionData.type, slide),
          width: 8,
          ...sectionData,
        },
      ]));
    }
  }

  const handleAddClinicalInformation = async (): Promise<void> => {
    setAnchorEl(null);
    if (slide) {
      await zeroDashSdk.mtb.clinicalInfo.createClinicalInformation(
        clinicalVersion.id,
        slide.id,
        initialClinicalInformation,
      );
      setClinicalInfo(initialClinicalInformation);
    }
  };

  const handleClick = (type: GermlineSectionType): void => {
    setAnchorEl(null);
    const lastOrder = germlineSections?.length > 0
      ? germlineSections.sort((a, b) => a.order - b.order)[germlineSections.length - 1].order
      : 0;
    createSlideSection({
      order: lastOrder + 1,
      type,
      name: type,
      description: getGermlineSectionInitialContent(type, slide),
    });
  };

  if (isPresentationMode) {
    return <div />;
  }

  return (
    <>
      <CustomButton
        variant="outline"
        label="Add section"
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        endIcon={<ChevronDownIcon />}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem
          onClick={handleAddClinicalInformation}
          disabled={Boolean(clinicalInfo) || !canCreateSection}
        >
          Clinical Information
        </MenuItem>
        {germlineSectionOptions.map((option: GermlineSectionType) => (
          <MenuItem
            key={option}
            onClick={(): void => handleClick(option)}
            disabled={
              !canCreateSection
              || (option !== 'Custom' && germlineSections
                .map((section) => section.type)
                .includes(option))
            }
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
