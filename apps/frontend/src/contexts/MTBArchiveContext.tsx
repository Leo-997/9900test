import { useSnackbar } from 'notistack';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
  type JSX,
} from 'react';
import MolAlterationsSelectModal from '../components/MTB/Views/Components/Slides/GenerateSlides/MolAlterationsSelectModal';
import { IArchiveSample } from '../types/MTB/Archive.types';
import { IMolecularAlterationDetail } from '../types/MTB/MolecularAlteration.types';
import { ISlide } from '../types/MTB/Slide.types';
import { getSlideAttachmentCaption, getSlideAttachmentTitle } from '../utils/functions/slideAttachementHelpers';
import { useClinical } from './ClinicalContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';
import { useNavigate } from 'react-router-dom';

export interface IMTBArchiveContext {
  selectedSample?: IArchiveSample;
  setSelectedSample: Dispatch<SetStateAction<IArchiveSample | undefined>>;
  addNewSlideCallback?: ((slide: ISlide) => void);
  setAddNewSlideCallback: Dispatch<SetStateAction<((slide: ISlide) => void) | undefined>>;
  isReportArchive: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MTBArchiveContext = createContext<IMTBArchiveContext | undefined>(undefined);

export const useMTBArchive = (): IMTBArchiveContext => {
  const ctx = useContext(MTBArchiveContext);

  if (!ctx) {
    throw new Error('MTBArchiveContext is not available at this scope.');
  }

  return ctx;
};

interface IProps {
  children?: ReactNode;
  isReportArchive?: boolean;
}

export function MTBArchiveProvider({
  children,
  isReportArchive = false,
}: IProps): JSX.Element {
  const navigate = useNavigate();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion, mtbBaseUrl } = useClinical();

  const [selectedSample, setSelectedSample] = useState<IArchiveSample>();
  const [addNewSlideCallback, setAddNewSlideCallback] = useState<(slide: ISlide) => void>();

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
        navigate(`/${mtbBaseUrl}/${resp.id}`);
      }
      if (addNewSlideCallback) {
        const slide = await zeroDashSdk.mtb.slides.getSlideById(clinicalVersion.id, resp.id);
        addNewSlideCallback(slide);
      }
      setAddNewSlideCallback(undefined);
    } catch (error) {
      enqueueSnackbar('Could not create slide, please try again', { variant: 'error' });
    }
  };

  const value = useMemo(() => ({
    selectedSample,
    setSelectedSample,
    addNewSlideCallback,
    setAddNewSlideCallback,
    isReportArchive,
  }), [
    selectedSample,
    setSelectedSample,
    addNewSlideCallback,
    setAddNewSlideCallback,
    isReportArchive,
  ]);

  return (
    <MTBArchiveContext.Provider value={value}>
      {children}
      {Boolean(addNewSlideCallback) && (
        <MolAlterationsSelectModal
          open={Boolean(addNewSlideCallback)}
          onClose={(): void => setAddNewSlideCallback(undefined)}
          onSave={createSlide}
          isNewSlide
        />
      )}
    </MTBArchiveContext.Provider>
  );
}
