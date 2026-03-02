import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import SlideBase from '../Common/SlideBase';
import SlideHeader from '../Common/SlideHeader';
import ActiveSlideSecondaryContent from './ActiveSlideSecondaryContent';
import MolAlterationsSelectModal from './GenerateSlides/MolAlterationsSelectModal';
import { ActiveSlideContent } from './ActiveSlideContent';

interface IProps {
  isPresentationMode: boolean;
  className?: string;
}

export default function ActiveSlide({
  isPresentationMode,
  className,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  useClinical();
  const {
    slide,
    updateSlideAlterations,
  } = useActiveSlide();

  const [open, setOpen] = useState<boolean>(false);

  const editSlide = async (newAlts?: IMolecularAlterationDetail[]): Promise<void> => {
    try {
      updateSlideAlterations(newAlts);
      setOpen(false);
    } catch (err) {
      enqueueSnackbar('Could not edit slide details, please try again,', { variant: 'error' });
    }
  };

  return (
    <SlideBase className={className}>
      <SlideHeader isPresentationMode={isPresentationMode} />
      <ActiveSlideContent isPresentationMode={isPresentationMode} />
      <ActiveSlideSecondaryContent isPresentationMode={isPresentationMode} />
      {open && (
        <MolAlterationsSelectModal
          open={open}
          onClose={(): void => setOpen(false)}
          onSave={editSlide}
          alterations={slide?.alterations}
        />
      )}
    </SlideBase>
  );
}
