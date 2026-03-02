import { Box } from '@mui/material';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { ISlideSection } from '../../../../../types/MTB/Slide.types';
import ClinicalInformationSection from '../Germline/ClinicalInformationSection';
import { GermlineSection } from './GermlineSection';

import type { JSX } from "react";

interface IProps {
  isPresentationMode: boolean;
}

export function GermlineContent({
  isPresentationMode,
}: IProps): JSX.Element {
  const {
    clinicalInfo,
    germlineSections,
  } = useActiveSlide();

  return (
    <Box display="flex" gap={4} flexDirection="column">
      {clinicalInfo && (
        <ClinicalInformationSection isPresentationMode={isPresentationMode} />
      )}
      {germlineSections.sort((a, b) => a.order - b.order).map((section: ISlideSection) => (
        <GermlineSection
          key={section?.id}
          section={section}
          isPresentationMode={isPresentationMode}
        />
      ))}
    </Box>
  );
}
