import {
  Box,
  Dialog as MuiDialog,
  styled,
} from '@mui/material';
import { drawDOM, exportPDF } from '@progress/kendo-drawing';
import { defineFont } from '@progress/kendo-drawing/pdf';
import { saveAs } from '@progress/kendo-file-saver';
import dayjs from 'dayjs';
import { DownloadIcon } from 'lucide-react';
import {
  useCallback, useEffect, useRef, useState, type JSX,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { dataURItoBlob } from '@/utils/functions/reportGenerationHelpers';
import { usePatient } from '@/contexts/PatientContext';
import { useClinical } from '@/contexts/ClinicalContext';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ActiveSlideProvider } from '@/contexts/ActiveSlideContext';
import CustomButton from '@/components/Common/Button';
import ItemButton from '@/components/Buttons/ItemButton';
import { ItemSelectLayout } from '../../../layouts/FullScreenLayout/ItemSelectLayout';
import NavBar from '../NavBar/Modal/NavBar';
import ClinicalInformationView from './ClinicalInformationView';
import SlideBase from './Components/Common/SlideBase';
import SlideHeader from './Components/Common/SlideHeader';
import ActiveSlide from './Components/Slides/ActiveSlide';
import DiscussionView from './DiscussionView';
import { MolecularFindingsViewExport } from './MolecularFindingsViewExport';

import arialBold from '../../../fonts/Arial-Bold.ttf';
import arialBoldItalic from '../../../fonts/Arial-BoldItalic.ttf';
import arialItalic from '../../../fonts/Arial-Italic.ttf';
import arial from '../../../fonts/Arial.ttf';
import helveticaBold from '../../../fonts/Helvetica-Bold.ttf';
import helveticaBoldItalic from '../../../fonts/Helvetica-BoldItalic.ttf';
import helveticaItalic from '../../../fonts/Helvetica-Italic.ttf';
import helvetica from '../../../fonts/Helvetica.ttf';
import robotoBold from '../../../fonts/Roboto-Bold.ttf';
import robotoBoldItalic from '../../../fonts/Roboto-BoldItalic.ttf';
import robotoItalic from '../../../fonts/Roboto-Italic.ttf';
import roboto from '../../../fonts/Roboto.ttf';
import TierReferenceGrid from './Components/Discussion/TierReferenceGrid';

interface IStyledContainerProps {
  isGenerating: boolean
}

const Dialog = styled(MuiDialog)({
  '& .MuiDialog-paper': {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    overflow: 'hidden',
    borderRadius: '0px',
    margin: '0px',
    padding: '0px',
  },
});

const RootContainer = styled('div')<IStyledContainerProps>(
  () => ({
    display: 'flex',
    flexDirection: 'column',
    width: '1280px',
    gridGap: '8px',
  }),
);

const SlideContainer = styled('div')<IStyledContainerProps>(
  () => ({
    width: '1280px',
    height: 'fit-content',
    '& .slide-header': {
      position: 'relative',
    },
    '& .img-actions': {
      display: 'none',
    },
    '& .discussion-recommendations': {
      width: 'calc(100% - 280px)',
    },
    '& .discussion-tier-grid': {
      display: 'none',
    },
  }),
);

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function MTBExport({
  open,
  onClose,
}: IProps): JSX.Element {
  const { demographics } = useAnalysisSet();
  const { patient } = usePatient();
  const {
    slides,
    clinicalVersion,
  } = useClinical();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const exportSlides = useCallback(async (): Promise<void> => {
    defineFont({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Roboto: roboto,
      'Roboto|bold': robotoBold,
      'Roboto|italic': robotoItalic,
      'Roboto|bold|italic': robotoBoldItalic,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Helvetica: helvetica,
      'Helvetica|bold': helveticaBold,
      'Helvetica|italic': helveticaItalic,
      'Helvetica|bold|italic': helveticaBoldItalic,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Arial: arial,
      'Arial|bold': arialBold,
      'Arial|italic': arialItalic,
      'Arial|bold|italic': arialBoldItalic,
    });
    if (reportRef.current) {
      const blob = await drawDOM(reportRef.current, {
        forcePageBreak: '.page-break',
        landscape: true,
        repeatHeaders: true,
      })
        .then((group) => exportPDF(
          group,
          {
            multiPage: true,
          },
        ))
        .then((dataUri) => {
          const data = dataURItoBlob(dataUri);
          return data;
        });

      // filename: 0X-XXXX_Firstname_LASTNAME_MTB_Meeting_YYYYMMDD
      saveAs(
        blob,
        `${patient.patientId}_`
        + `${demographics?.firstName}_`
        + `${demographics?.lastName?.toUpperCase()}_MTB_Meeting_`
        + `${dayjs().format('YYYYMMDD')}`,
      );
      setIsGenerating(false);
    }
  }, [demographics?.firstName, demographics?.lastName, patient.patientId]);

  useEffect(() => {
    if (isGenerating) {
      exportSlides();
    }
  }, [exportSlides, isGenerating]);

  return (
    <Dialog
      fullScreen
      fullWidth
      open={open}
      onClose={onClose}
    >
      <ItemSelectLayout
        mainContent={(
          <RootContainer
            isGenerating={isGenerating}
            ref={reportRef}
          >
            <SlideContainer isGenerating={isGenerating}>
              <ClinicalInformationView isPresentationMode />
            </SlideContainer>
            <div className="page-break" />
            <DndProvider backend={HTML5Backend}>
              <SlideContainer isGenerating={isGenerating}>
                <SlideBase>
                  <SlideHeader isPresentationMode />
                  <MolecularFindingsViewExport
                    germlineConsent={
                      !!demographics?.germlineConsent
                      || (!!demographics?.category1Consent && !!demographics.category2Consent)
                    }
                  />
                </SlideBase>
              </SlideContainer>
            </DndProvider>
            <div className="page-break" />
            {slides.map((s) => (
              <ActiveSlideProvider key={s.id} slideProp={s}>
                <SlideContainer isGenerating={isGenerating}>
                  <ActiveSlide isPresentationMode />
                </SlideContainer>
                <div className="page-break" />
              </ActiveSlideProvider>
            ))}
            <Box position="relative">
              <Box
                position="absolute"
                top="94px"
                right="24px"
                zIndex={1000}
                width="275px"
              >
                <TierReferenceGrid defaultOpen disableClicks />
              </Box>
              <SlideContainer isGenerating={isGenerating}>
                <DiscussionView isPresentationMode />
              </SlideContainer>
            </Box>
          </RootContainer>
        )}
        navBar={(
          <NavBar returnFn={onClose} />
        )}
        leftPaneNodes={(
          <ItemButton
            mainText="Export Presentation"
            subText={clinicalVersion.patientId}
            isActive
            additionalContent={(
              <Box paddingTop="24px" display="flex" width="100%">
                <CustomButton
                  variant="bold"
                  size="small"
                  label="Download"
                  style={{
                    minWidth: '140px',
                  }}
                  startIcon={<DownloadIcon />}
                  onClick={(): void => setIsGenerating(true)}
                  loading={isGenerating}
                />
              </Box>
              )}
          />
        )}
      />
    </Dialog>
  );
}
