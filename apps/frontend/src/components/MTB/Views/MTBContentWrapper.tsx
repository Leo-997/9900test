import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { corePalette } from '@/themes/colours';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ActiveSlideContext, ActiveSlideProvider } from '../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../types/MTB/MolecularAlteration.types';
import { getSlideAttachmentCaption, getSlideAttachmentTitle } from '../../../utils/functions/slideAttachementHelpers';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import ClinicalInformationView from './ClinicalInformationView';
import SlideBase from './Components/Common/SlideBase';
import SlideHeader from './Components/Common/SlideHeader';
import ActiveSlide from './Components/Slides/ActiveSlide';
import MolAlterationsSelectModal from './Components/Slides/GenerateSlides/MolAlterationsSelectModal';
import IndexBar from './Components/Slides/IndexBar/IndexBar';
import { PresentationIndexBar } from './Components/Slides/IndexBar/PresentationIndexBar';
import DiscussionView from './DiscussionView';
import { MolecularFindingsView } from './MolecularFindingsView';
import SlidesOverview from './SlidesOverview';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    paddingTop: '80px',
    paddingBottom: '150px',
    overflowY: 'auto',

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    '& .simplebar-scrollbar::before': {
      backgroundColor: '#FFFFFF',
    },
  },
  slidesWrapper: {
    width: '90%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'top',
  },
}));

export default function MTBContentWrapper(): JSX.Element {
  const classes = useStyles();
  const navigate = useNavigate();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    slides,
    getSlides,
    loading,
    clinicalVersion,
    activeView,
    mtbBaseUrl,
    isPresentationMode,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const { demographics } = useAnalysisSet();

  const canEditSampleData = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const views = useMemo(() => [
    'OVERVIEW',
    'CLINICAL_INFORMATION',
    'MOLECULAR_FINDINGS',
    ...slides
      .filter((slide) => !slide.hidden)
      .map((slide) => slide.id),
    'DISCUSSION',
  ], [slides]);

  const getDefaultSlideNote = (alterations?: IMolecularAlterationDetail[]): string => {
    if (!alterations || alterations.filter((alt) => alt.description).length === 0) {
      return JSON.stringify([
        {
          id: '1',
          type: 'p',
          children: [{ text: '' }],
        },
      ]);
    }

    return JSON.stringify(alterations.filter((alt) => alt.description).map((alt, index) => ({
      id: index,
      type: 'p',
      children: [
        {
          text: alt.description || '',
        },
      ],
    })));
  };

  const createSlide = async (alterations?: IMolecularAlterationDetail[]): Promise<void> => {
    try {
      const resp = await zeroDashSdk.mtb.slides.createSlide(
        clinicalVersion.id,
        {
          title: alterations?.some((a) => a.mutationType.includes('GERMLINE')) ? 'Germline Findings' : undefined,
          alterations: alterations?.map((a) => a.id),
          slideNote: getDefaultSlideNote(alterations),
        },
      );
      const promises: Promise<void>[] = [];
      for (const alteration of (alterations || [])) {
        if (alteration.mutationType === 'RNA_SEQ' || alteration.mutationType === 'MUTATIONAL_SIG') {
          promises.push(
            zeroDashSdk.mtb.molAlteration.getMolAlterationById(clinicalVersion.id, alteration.id)
              .then((altById) => {
                if (altById.additionalData?.fileId) {
                  zeroDashSdk.mtb.slides.addSlideAttachment(
                    clinicalVersion.id,
                    resp.id,
                    {
                      fileId: altById.additionalData.fileId as string,
                      fileType: 'png',
                      caption: getSlideAttachmentCaption(alteration),
                      title: getSlideAttachmentTitle(alteration),
                      width: 2,
                    },
                  );
                }
              }),
          );
        }
      }
      await Promise.all(promises);
      if (resp) {
        getSlides();
        setModalOpen(false);
        navigate(`/${mtbBaseUrl}/${resp.id}`);
      }
    } catch {
      enqueueSnackbar('Could not create slide, please try again', { variant: 'error' });
    }
  };

  const getContent = useCallback((): JSX.Element => {
    switch (activeView) {
      case 'CLINICAL_INFORMATION':
        return (
          <ClinicalInformationView isPresentationMode={isPresentationMode} />
        );
      case 'MOLECULAR_FINDINGS':
        return (
          <SlideBase>
            <SlideHeader isPresentationMode={isPresentationMode} />
            <MolecularFindingsView
              germlineConsent={
                !!demographics?.germlineConsent
                || (!!demographics?.category2Consent && !!demographics.category1Consent)
              }
              clinicalVersionId={clinicalVersion.id}
              frequencyUnits={clinicalVersion.frequencyUnits}
              isPresentationMode={isPresentationMode}
              canEditSampleData={canEditSampleData && !isReadOnly}
            />
          </SlideBase>
        );
      case 'DISCUSSION':
        return (
          <DiscussionView isPresentationMode={isPresentationMode} />
        );
      case 'OVERVIEW':
        return (
          <SlidesOverview setOpen={setModalOpen} />
        );
      default:
        return (
          <ActiveSlideProvider>
            <ActiveSlideContext.Consumer>
              {(ctx): JSX.Element => (
                ctx?.loading
                  ? (
                    <Box position="relative" top="30vh">
                      <LoadingAnimation
                        dotColour={corePalette.white}
                        baseColour={corePalette.green30}
                      />
                    </Box>
                  ) : (
                    <ActiveSlide
                      key={activeView}
                      isPresentationMode={isPresentationMode}
                    />
                  )
              )}
            </ActiveSlideContext.Consumer>
          </ActiveSlideProvider>
        );
    }
  }, [
    activeView,
    clinicalVersion.id,
    clinicalVersion.frequencyUnits,
    isPresentationMode,
    canEditSampleData,
    isReadOnly,
    demographics?.germlineConsent,
    demographics?.category1Consent,
    demographics?.category2Consent,
  ]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent): void => {
      if (isPresentationMode) {
        const currentIndex = views.indexOf(activeView);
        if (event.key === 'ArrowLeft') {
          const newIndex = (currentIndex + views.length - 1) % views.length;
          navigate(`/${mtbBaseUrl}/${views[newIndex]}`);
        } else if (event.key === 'ArrowRight') {
          const newIndex = (currentIndex + 1) % views.length;
          navigate(`/${mtbBaseUrl}/${views[newIndex]}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [activeView, isPresentationMode, mtbBaseUrl, navigate, views]);

  return (
    <>
      {loading ? (
        <LoadingAnimation
          dotColour={corePalette.white}
          baseColour={corePalette.green30}
        />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <ScrollableSection
            className={classes.root}
            style={{
              zIndex: 0,
              paddingTop: isPresentationMode ? 0 : undefined,
              paddingBottom: isPresentationMode ? 0 : undefined,
            }}
          >
            {getContent()}
          </ScrollableSection>
        </DndProvider>
      )}
      {isPresentationMode ? (
        <PresentationIndexBar />
      ) : (
        <IndexBar
          setOpen={setModalOpen}
        />
      )}
      {modalOpen && (
        <MolAlterationsSelectModal
          open={modalOpen}
          onClose={(): void => setModalOpen(false)}
          onSave={(alterations) => {
            createSlide(alterations);
          }}
          isNewSlide
        />
      )}
    </>
  );
}
