import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import DataTable from '../../../../../layouts/Tables/DataTable';
import { ClinicalInformationData } from '../../../../../types/MTB/ClinicalInfo.types';
import { ISlide, ISlideSection } from '../../../../../types/MTB/Slide.types';
import { RichTextEditor } from '../../../../Input/RichTextEditor/RichTextEditor';
import CustomTypography from '../../../../Common/Typography';
import { CustomAddButton } from '../../../CommonButtons/CustomAddButton';

interface IProps {
  slideId?: string;
}

export default function ArchivePerSlideSections({
  slideId,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    selectedSample,
    isReportArchive,
    setAddNewSlideCallback,
  } = useMTBArchive();
  const {
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
    clinicalVersion,
  } = useClinical();
  const {
    slide: activeSlide,
    germlineSections: activeSlideGermlineSections,
    setGermlineSections: setActiveSlideGermlineSections,
    clinicalInfo: activeSlideClinicalInfo,
    setClinicalInfo: setActiveSlideClinicalInfo,
  } = useActiveSlide();

  const [clinicalInfo, setClinicalInfo] = useState<ClinicalInformationData>();
  const [germlineSections, setGermlineSections] = useState<ISlideSection[]>([]);

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const createClinicalInfoSection = useCallback(async (
    slideToAddTo: ISlide,
    clinicalInformation: ClinicalInformationData,
  ) => {
    try {
      await zeroDashSdk.mtb.clinicalInfo.createClinicalInformation(
        clinicalVersion.id,
        slideToAddTo.id,
        clinicalInformation,
      );
      setActiveSlideClinicalInfo(clinicalInformation);
      enqueueSnackbar('Added to the slide.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not add clinicial information to slide, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideClinicalInfo,
    zeroDashSdk.mtb.clinicalInfo,
    clinicalVersion.id,
  ]);

  const updateClinicalInfoSection = useCallback(async (
    slideToAddTo: ISlide,
    clinicalInformation: ClinicalInformationData,
  ) => {
    try {
      await zeroDashSdk.mtb.clinicalInfo.updateClinicalInformation(
        clinicalVersion.id,
        slideToAddTo.id,
        clinicalInformation,
      );
      setActiveSlideClinicalInfo(clinicalInformation);
      enqueueSnackbar('Updated clinical information section.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not update clinicial information, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideClinicalInfo,
    zeroDashSdk.mtb.clinicalInfo,
    clinicalVersion.id,
  ]);

  const deleteClinicalInformation = useCallback(async (
    removeFromSlideId: string,
  ) => {
    try {
      await zeroDashSdk.mtb.clinicalInfo.deleteClinicalInformation(
        clinicalVersion.id,
        removeFromSlideId,
      );
      setActiveSlideClinicalInfo(undefined);
      enqueueSnackbar('Removed clinical information section.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not remove clinicial information, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideClinicalInfo,
    zeroDashSdk.mtb.clinicalInfo,
    clinicalVersion.id,
  ]);

  const createGermlineSection = useCallback(async (
    slideToAddTo: ISlide,
    section: ISlideSection,
  ) => {
    try {
      await zeroDashSdk.mtb.slides.createSlideSection(
        clinicalVersion.id,
        slideToAddTo.id,
        {
          type: section.type,
          name: section.name,
          description: section.description,
          order: activeSlideGermlineSections.length + 1,
        },
      );
      const newSections = await zeroDashSdk.mtb.slides.getSectionsBySlideId(
        clinicalVersion.id,
        slideToAddTo.id,
      );
      setActiveSlideGermlineSections(newSections);
      enqueueSnackbar('Created new section.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not create a new section, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideGermlineSections,
    zeroDashSdk.mtb.slides,
    activeSlideGermlineSections,
    clinicalVersion.id,
  ]);

  const updateGermlineSection = useCallback(async (
    sectionId: string,
    section: ISlideSection,
  ) => {
    try {
      await zeroDashSdk.mtb.slides.updateSlideSection(
        clinicalVersion.id,
        sectionId,
        {
          name: section.name,
          description: section.description,
        },
      );
      if (activeSlide) {
        const newSections = await zeroDashSdk.mtb.slides.getSectionsBySlideId(
          clinicalVersion.id,
          activeSlide.id,
        );
        setActiveSlideGermlineSections(newSections);
      }
      enqueueSnackbar('Updated the slide section.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not update the section, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideGermlineSections,
    activeSlide,
    zeroDashSdk.mtb.slides,
    clinicalVersion.id,
  ]);

  const deleteGermlineSection = useCallback(async (
    sectionId: string,
  ) => {
    try {
      await zeroDashSdk.mtb.slides.deleteSlideSection(
        clinicalVersion.id,
        sectionId,
      );
      if (activeSlide) {
        const newSections = await zeroDashSdk.mtb.slides.getSectionsBySlideId(
          clinicalVersion.id,
          activeSlide.id,
        );
        setActiveSlideGermlineSections(newSections);
      }
      enqueueSnackbar('Remove the slide section from the current slide.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not remove the section, please try again.', { variant: 'error' });
    }
  }, [
    enqueueSnackbar,
    setActiveSlideGermlineSections,
    activeSlide,
    zeroDashSdk.mtb.slides,
    clinicalVersion.id,
  ]);

  const getClinicalInfoButtonLabel = useCallback(() => {
    if (JSON.stringify(clinicalInfo) === JSON.stringify(activeSlideClinicalInfo)) {
      return 'Remove from slide';
    }
    return `${activeSlideClinicalInfo ? 'Update' : 'Add to'} current slide`;
  }, [activeSlideClinicalInfo, clinicalInfo]);

  const getMatchingSection = useCallback((section: ISlideSection) => (
    activeSlideGermlineSections.find(
      (s) => (
        s.type === section.type
        && s.name === section.name
        && s.description === section.description
      ),
    )
  ), [activeSlideGermlineSections]);

  const getGermlineSectionButtonLabel = useCallback((section: ISlideSection) => {
    if (getMatchingSection(section)) {
      return 'Remove from slide';
    }
    return `${activeSlideGermlineSections.some((s) => (s.type === section.type)) ? 'Update' : 'Add to'} current slide`;
  }, [activeSlideGermlineSections, getMatchingSection]);

  useEffect(() => {
    if (slideId && selectedSample?.clinicalVersionId) {
      zeroDashSdk.mtb.clinicalInfo.getClinicalInformation(
        selectedSample.clinicalVersionId,
        slideId,
      )
        .then((resp) => setClinicalInfo(resp));
    }
  }, [selectedSample?.clinicalVersionId, slideId, zeroDashSdk.mtb.clinicalInfo]);

  useEffect(() => {
    if (slideId && selectedSample?.clinicalVersionId) {
      zeroDashSdk.mtb.slides.getSectionsBySlideId(
        selectedSample.clinicalVersionId,
        slideId,
      )
        .then((resp) => setGermlineSections(resp));
    }
  }, [selectedSample?.clinicalVersionId, slideId, zeroDashSdk.mtb.slides]);

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      {clinicalInfo && (
      <>
        <Box display="flex" justifyContent="space-between">
          <CustomTypography variant="h5">
            Clinical information
          </CustomTypography>
          {!isReportArchive && (
            <Box display="flex" gap="16px" justifyContent="flex-end">
              {activeSlide && canEditSlide && !isReadOnly && (
                <CustomAddButton
                  isAdded={JSON.stringify(clinicalInfo) === JSON.stringify(activeSlideClinicalInfo)}
                  onAdd={(): Promise<void> => (
                    activeSlideClinicalInfo
                      ? updateClinicalInfoSection(activeSlide, clinicalInfo)
                      : createClinicalInfoSection(activeSlide, clinicalInfo)
                  )}
                  onRemove={(): Promise<void> => deleteClinicalInformation(activeSlide.id)}
                  buttonLabel={getClinicalInfoButtonLabel()}
                />
              )}
              {canEditSlide && !isReadOnly && (
                <CustomAddButton
                  // will never be added to a slide that does not yet exist
                  isAdded={false}
                  onAdd={(): void => (
                    setAddNewSlideCallback(() => (
                      (s: ISlide) => createClinicalInfoSection(s, clinicalInfo)
                    ))
                  )}
                  buttonLabel="Add to a new slide"
                />
              )}
            </Box>
          )}
        </Box>
        <DataTable
          rows={
            Object.entries(clinicalInfo)
              .filter(([, val]) => !val.isHidden)
              .map(([key, val]) => ({
                cells: [
                  {
                    content: key,
                    align: 'flex-start',
                  },
                  {
                    content: `${val.value}${val.note ? ` - ${val.note}` : ''}`,
                    align: 'flex-start',
                  },
                ],
              }))
          }
        />
      </>
      )}
      {germlineSections.sort((a, b) => a.order - b.order).map((section) => (
        <Box
          key={section.id}
          display="flex"
          flexDirection="column"
          gap="8px"
          justifyContent="flex-start"
        >
          <Box display="flex" justifyContent="space-between">
            <CustomTypography variant="h5">
              {section?.name}
            </CustomTypography>
            {!isReportArchive && (
              <Box display="flex" gap="16px" justifyContent="flex-end">
                {activeSlide && canEditSlide && !isReadOnly && (
                  <CustomAddButton
                    isAdded={Boolean(getMatchingSection(section))}
                    onAdd={(): Promise<void> => (
                      activeSlideGermlineSections.some((s) => s.type === section.type)
                        ? (
                          updateGermlineSection(
                            activeSlideGermlineSections.find(
                              (s) => s.type === section.type,
                            )?.id || '',
                            section,
                          )
                        ) : createGermlineSection(activeSlide, section)
                    )}
                    onRemove={(): void => {
                      const matchingSection = getMatchingSection(section);
                      if (matchingSection) deleteGermlineSection(matchingSection.id);
                    }}
                    buttonLabel={getGermlineSectionButtonLabel(section)}
                  />
                )}
                {canEditSlide && !isReadOnly && (
                  <CustomAddButton
                    // will never be added to a slide that does not yet exist
                    isAdded={false}
                    onAdd={(): void => (
                      setAddNewSlideCallback(() => (
                        (s: ISlide) => createGermlineSection(s, section)
                      ))
                    )}
                    buttonLabel="Add to a new slide"
                  />
                )}
              </Box>
            )}
          </Box>
          <Box bgcolor={corePalette.white}>
            <RichTextEditor
              mode="readOnly"
              commentMode="readOnly"
              hideComments
              initialText={section.description}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
