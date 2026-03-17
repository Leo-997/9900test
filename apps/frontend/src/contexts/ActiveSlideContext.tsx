import { IDownloadURL } from '@/types/FileTracker/FileTracker.types';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { ClinicalInformationData } from '../types/MTB/ClinicalInfo.types';
import { IMolecularAlterationDetail } from '../types/MTB/MolecularAlteration.types';
import { ISlideAttachment } from '../types/MTB/MTB.types';
import { IFetchRecommendation } from '../types/MTB/Recommendation.types';
import { ISlide, ISlideSection, ISlideWithMetadata } from '../types/MTB/Slide.types';
import { useClinical } from './ClinicalContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  slideProp?: ISlideWithMetadata;
  children: ReactNode;
}

interface ISlideComponents {
  slide: boolean;
  attachments: boolean;
  clinicalInfo: boolean;
  germlineSections: boolean;
  recommendations: boolean;
}

interface IActiveSlideContext {
  slide?: ISlide;
  recommendations: IFetchRecommendation[];
  setRecommendations: Dispatch<SetStateAction<IFetchRecommendation[]>>;
  germlineSections: ISlideSection[];
  setGermlineSections: Dispatch<SetStateAction<ISlideSection[]>>;
  clinicalInfo: ClinicalInformationData | undefined;
  setClinicalInfo: Dispatch<SetStateAction<ClinicalInformationData | undefined>>;
  attachments: ISlideAttachment[];
  setAttachments: Dispatch<SetStateAction<ISlideAttachment[]>>;
  getSlideFiles: (slideId: string, triggerReload?: boolean) => Promise<void>;
  updateSlideData: <T extends keyof ISlide, >(key: T, val: ISlide[T]) => void;
  updateSlideAlterations: (newAlts?: IMolecularAlterationDetail[]) => Promise<void>;
  isGermline: boolean;
  loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ActiveSlideContext = createContext<IActiveSlideContext | undefined>(
  undefined,
);

ActiveSlideContext.displayName = 'ActiveSlideContext';

export const useActiveSlide = (): IActiveSlideContext => {
  const ctx = useContext(ActiveSlideContext);

  if (!ctx) throw new Error('Active slide context is not available at this scope');

  return ctx;
};

export function ActiveSlideProvider({
  slideProp,
  children,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    slides,
    setSlides,
    activeView,
    clinicalVersion,
  } = useClinical();

  const existingSlide = slideProp ?? slides.find((s) => s.id === activeView);

  const [slide, setSlide] = useState<ISlide | undefined>(existingSlide);
  const [attachments, setAttachments] = useState<ISlideAttachment[]>(
    existingSlide?.attachments || [],
  );
  const [clinicalInfo, setClinicalInfo] = useState<ClinicalInformationData | undefined>(
    existingSlide?.clinicalInfo || undefined,
  );
  const [germlineSections, setGermlineSections] = useState<ISlideSection[]>(
    existingSlide?.germlineSections || [],
  );
  const [recommendations, setRecommendations] = useState<IFetchRecommendation[]>(
    existingSlide?.recommendations || [],
  );
  const [isGermline, setIsGermline] = useState<boolean>(false);
  const [loading, setLoading] = useState<ISlideComponents>({
    slide: false,
    attachments: false,
    clinicalInfo: false,
    germlineSections: false,
    recommendations: false,
  });

  const getSlideData = useCallback(async (): Promise<void> => {
    try {
      setLoading((prev) => ({
        ...prev,
        slide: true,
      }));
      const resp = await zeroDashSdk.mtb.slides.getSlideById(clinicalVersion.id, activeView);
      setSlide(resp);
    } catch (err) {
      setSlide(undefined);
    } finally {
      setLoading((prev) => ({
        ...prev,
        slide: false,
      }));
    }
  }, [activeView, clinicalVersion.id, zeroDashSdk.mtb.slides]);

  const getRecommendations = useCallback(async (): Promise<void> => {
    if (slide?.id) {
      try {
        setLoading((prev) => ({
          ...prev,
          recommendations: true,
        }));
        const resp = await zeroDashSdk.mtb.recommendation.getAllRecommendations(
          clinicalVersion.id,
          {
            molAlterationGroupId: slide?.molAlterationGroupId,
            slideId: slide?.id,
            types: ['THERAPY', 'CHANGE_DIAGNOSIS', 'GERMLINE', 'TEXT'],
          },
        );
        const getRecOrder = (rec: IFetchRecommendation): number => (
          rec.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === slide.id)?.order ?? 0
        );
        setRecommendations(resp.sort((a, b) => {
          if (!getRecOrder(a)) return -1;
          if (!getRecOrder(b)) return 1;
          return getRecOrder(a) - getRecOrder(b);
        }));
      } catch (err) {
        setRecommendations([]);
      } finally {
        setLoading((prev) => ({
          ...prev,
          recommendations: false,
        }));
      }
    }
  }, [
    clinicalVersion.id,
    slide?.id,
    slide?.molAlterationGroupId,
    zeroDashSdk.mtb.recommendation,
  ]);

  const getGermlineSections = useCallback(async () => {
    if (slide?.id && isGermline) {
      try {
        setLoading((prev) => ({
          ...prev,
          germlineSections: true,
        }));
        const resp = await zeroDashSdk.mtb.slides.getSectionsBySlideId(
          clinicalVersion.id,
          slide.id,
        );
        setGermlineSections(resp);
      } catch (err) {
        setGermlineSections([]);
      } finally {
        setLoading((prev) => ({
          ...prev,
          germlineSections: false,
        }));
      }
    }
  }, [clinicalVersion.id, isGermline, slide?.id, zeroDashSdk.mtb.slides]);

  const getClinicalInfo = useCallback(async () => {
    if (slide?.id && isGermline) {
      try {
        setLoading((prev) => ({
          ...prev,
          clinicalInfo: true,
        }));
        const resp = await zeroDashSdk.mtb.clinicalInfo.getClinicalInformation(
          clinicalVersion.id,
          slide.id,
        );
        setClinicalInfo(resp);
      } catch (err) {
        setClinicalInfo(undefined);
      } finally {
        setLoading((prev) => ({
          ...prev,
          clinicalInfo: false,
        }));
      }
    }
  }, [clinicalVersion.id, isGermline, slide?.id, zeroDashSdk.mtb.clinicalInfo]);

  const getSlideFiles = useCallback(async (
    slideId: string,
    triggerReload?: boolean,
  ): Promise<void> => {
    if (slideId) {
      try {
        if (triggerReload) {
          setLoading((prev) => ({
            ...prev,
            attachments: true,
          }));
        }

        // Get relevant TPM/mutsig files
        const filesData = await zeroDashSdk.mtb.slides.getFilesBySlideId(
          clinicalVersion.id,
          slideId,
        );
        if (filesData.length === 0) {
          setAttachments([]);
        } else {
          // done this way so that the url is the same origin and the export function
          // exports the image correctly
          const fileUrl: IDownloadURL[] = await Promise.all(filesData.map(async (file) => ({
            fileId: file.fileId,
            fileName: file.title,
            url: await zeroDashSdk.filetracker.downloadFile(file.fileId)
              .then((resp) => URL.createObjectURL(resp)),
          })));

          if (fileUrl.length > 0) {
            const urlMappedFiles = filesData.map((graph) => ({
              ...graph,
              url: fileUrl.find((file) => file.fileId === graph.fileId)?.url || '',
            }));
            setAttachments(urlMappedFiles);
          }
        }
      } catch (err) {
        setAttachments([]);
      } finally {
        if (triggerReload) {
          setLoading((prev) => ({
            ...prev,
            attachments: false,
          }));
        }
      }
    }
  }, [zeroDashSdk.mtb.slides, zeroDashSdk.filetracker, clinicalVersion.id]);

  const updateSlideData = useCallback(<T extends keyof ISlide, >(key: T, val: ISlide[T]): void => {
    if (slide) {
      setSlide((prev) => {
        if (prev) {
          return {
            ...prev,
            [key]: val,
          };
        }

        return prev;
      });

      // Update the slide in place
      setSlides((prev) => prev.map((s) => ({
        ...(s.id === slide.id ? slide : s),
      })));
    }
  }, [setSlides, slide]);

  const updateSlideAlterations = useCallback(async (
    newAlts?: IMolecularAlterationDetail[],
  ): Promise<void> => {
    try {
      if (slide) {
        await zeroDashSdk.mtb.slides.updateMolecularGroup(clinicalVersion.id, slide.id, {
          add: newAlts?.map((a) => a.id),
          remove: slide.alterations?.map((a) => a.id),
        });
        updateSlideData('alterations', newAlts);
      }
    } catch (error) {
      console.error(error);
    }
  }, [clinicalVersion.id, slide, updateSlideData, zeroDashSdk.mtb.slides]);

  useEffect(() => {
    if (!slideProp) getSlideData();
  }, [getSlideData, slideProp]);

  useEffect(() => {
    if (slide?.id) getSlideFiles(slide.id);
  }, [getSlideFiles, slide?.id]);

  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  useEffect(() => {
    getGermlineSections();
  }, [getGermlineSections]);

  useEffect(() => {
    getClinicalInfo();
  }, [getClinicalInfo]);

  useEffect(() => {
    setIsGermline(slide?.alterations?.some((a) => a.mutationType.includes('GERMLINE')) || false);
  }, [slide?.alterations]);

  const value = useMemo(() => ({
    slide,
    recommendations,
    setRecommendations,
    germlineSections,
    setGermlineSections,
    clinicalInfo,
    setClinicalInfo,
    attachments,
    setAttachments,
    getSlideFiles,
    updateSlideData,
    updateSlideAlterations,
    isGermline,
    loading: Object.values(loading).some((v) => v),
  }), [
    slide,
    recommendations,
    setRecommendations,
    germlineSections,
    setGermlineSections,
    clinicalInfo,
    setClinicalInfo,
    attachments,
    setAttachments,
    getSlideFiles,
    updateSlideData,
    updateSlideAlterations,
    isGermline,
    loading,
  ]);

  return (
    <ActiveSlideContext.Provider
      value={value}
    >
      {children}
    </ActiveSlideContext.Provider>
  );
}
