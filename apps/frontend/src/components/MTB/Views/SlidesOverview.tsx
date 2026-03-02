import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as motion from 'motion/react-client';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinical } from '../../../contexts/ClinicalContext';
import { ISlide } from '../../../types/MTB/Slide.types';
import SlideItem from './Components/Slides/SlideItem';
import StaticSlideItem from './Components/Slides/StaticSlideItem';

const useStyles = makeStyles(() => ({
  slidesWrapper: {
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'top',
    gap: '24px',
    padding: '0% 5%',
  },
}));

interface IProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SlidesOverview({
  setOpen,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const classes = useStyles();
  const navigate = useNavigate();
  const {
    clinicalVersion,
    slides,
    setSlides,
    mtbBaseUrl,
    isPresentationMode,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const canAddSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const handleReorderSlides = async (index: number, dir: 'left' | 'right'): Promise<void> => {
    const slideToMove = slides[index];
    let newArr = [...slides];
    newArr.splice(index, 1);
    if (dir === 'left') {
      newArr.splice(index - 1, 0, slideToMove);
    } else if (dir === 'right') {
      newArr.splice(index + 1, 0, slideToMove);
    }

    newArr = newArr.map((s, i) => ({ ...s, index: i }));

    await zeroDashSdk.mtb.slides.updateSlideOrder(clinicalVersion.id, [
      ...newArr.map((s) => ({
        id: s.id,
        index: s.index,
      })),
    ]);

    setSlides(newArr);
  };

  return (
    <Box
      className={classes.slidesWrapper}
    >
      <StaticSlideItem
        title="Clinical Information"
        value="CLINICAL_INFORMATION"
        onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/CLINICAL_INFORMATION`)}
      />
      <StaticSlideItem
        title="Molecular Findings"
        value="MOLECULAR_FINDINGS"
        onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/MOLECULAR_FINDINGS`)}
      />
      {slides
        .filter((s) => (isPresentationMode ? !s.hidden : s))
        .map((s: ISlide, index: number, self) => (
          <motion.div
            key={`group-${s.id}`}
            layout
            transition={{
              ease: [0.19, 1, 0.22, 1],
              duration: 0.4,
            }}
          >
            <SlideItem
              data={s}
              index={index}
              isLastItem={index === self.length - 1}
              onSlideMove={(dir): Promise<void> => handleReorderSlides(index, dir)}
            />
          </motion.div>
        ))}
      {canAddSlide && !isPresentationMode && !isReadOnly && (
        <SlideItem
          key="slide-item-new"
          onClick={(): void => setOpen(true)}
        />
      )}
      <StaticSlideItem
        title="Discussion"
        value="DISCUSSION"
        onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/DISCUSSION`)}
      />
    </Box>
  );
}
