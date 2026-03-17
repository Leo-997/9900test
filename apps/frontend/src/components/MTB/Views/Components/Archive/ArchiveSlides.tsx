import { Box, Chip, lighten } from '@mui/material';
import { useEffect, useState, type JSX } from 'react';
import clsx from 'clsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { makeStyles } from '@mui/styles';
import { corePalette } from '@/themes/colours';
import { ISlide } from '../../../../../types/MTB/Slide.types';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import CustomTypography from '../../../../Common/Typography';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import SlideMolecularAlterationChip from '../../../../Chips/SlideMolecularAlterationChip';
import ArchiveSlideModal from './ArchiveSlideModal';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { IClinicalVersionRaw, Views } from '../../../../../types/MTB/MTB.types';
import ArchiveClinicalInformationModal from './ArchiveClinicalInformationModal';
import ArchiveMolecularFindingsModal from './ArchiveMolecularFindingsModal';
import ArchiveDiscussionModal from './ArchiveDiscussionModal';

const useStyles = makeStyles(() => ({
  slide: {
    width: '300px',
    height: '280px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexShrink: 0,
    cursor: 'pointer',
    border: '1px solid #FFFFFF',
    transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
  },
  slideSelected: {
    backgroundColor: lighten(corePalette.green10, 0.5),
    border: `1px solid ${corePalette.green150}`,
  },
  chip: {
    height: '36px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #ECF0F3',
    borderRadius: '8px',
    marginRight: '8px',
    marginTop: '8px',
  },
}));

export default function ArchiveSlides(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { selectedSample } = useMTBArchive();

  const [slides, setSlides] = useState<ISlide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<ISlide | Views>();
  const [clinicalVersion, setClinicalVersion] = useState<IClinicalVersionRaw>();

  useEffect(() => {
    if (selectedSample?.clinicalVersionId) {
      zeroDashSdk.mtb.clinical.getClinicalVersionById(
        selectedSample.clinicalVersionId,
      ).then((resp) => setClinicalVersion(resp));
    }
  }, [selectedSample?.clinicalVersionId, zeroDashSdk.mtb.clinical]);

  useEffect(() => {
    if (selectedSample?.clinicalVersionId) {
      zeroDashSdk.mtb.slides.getSlidesByVersionId(selectedSample.clinicalVersionId)
        .then((resp) => setSlides(resp));
    }
  }, [selectedSample?.clinicalVersionId, zeroDashSdk.mtb.slides]);

  return (
    <>
      <Box
        display="flex"
        gap="16px"
        flexWrap="wrap"
        minWidth="650px"
      >
        <Box
          key="clinical-information-slide"
          className={clsx({
            [classes.slide]: true,
            [classes.slideSelected]: selectedSlide === 'CLINICAL_INFORMATION',
          })}
          onClick={(): void => setSelectedSlide('CLINICAL_INFORMATION')}
        >
          <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
            Clinical Information
          </CustomTypography>
        </Box>
        <Box
          key="clinical-information-slide"
          className={clsx({
            [classes.slide]: true,
            [classes.slideSelected]: selectedSlide === 'MOLECULAR_FINDINGS',
          })}
          onClick={(): void => setSelectedSlide('MOLECULAR_FINDINGS')}
        >
          <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
            Molecular Findings
          </CustomTypography>
        </Box>
        {slides.map((slide) => (
          <Box
            key={slide.id}
            className={clsx({
              [classes.slide]: true,
              [classes.slideSelected]: typeof selectedSlide !== 'string' && selectedSlide?.id === slide.id,
            })}
            onClick={(): void => setSelectedSlide(slide)}
          >
            <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
              {slide.title || 'Untitled slide'}
            </CustomTypography>
            {slide.alterations && (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                marginTop="auto"
                width="100%"
              >
                <CustomTypography variant="label">MOLECULAR ALTERATIONS</CustomTypography>
                <Box
                  display="flex"
                  flexDirection="row"
                  flexWrap="wrap"
                  justifyContent="flex-start"
                  alignItems="center"
                  width="100%"
                >
                  {slide.alterations.length > 3 ? (
                    <>
                      {slide.alterations
                        .slice(0, 3)
                        .map((a: IMolecularAlterationDetail) => (
                          <SlideMolecularAlterationChip
                            key={a.id}
                            data={a}
                          />
                        ))}
                      <Chip
                        label={(
                          <CustomTypography
                            variant="bodyRegular"
                            tooltipText={slide.alterations
                              .slice(3, slide.alterations.length)
                              .map((a) => a.gene)
                              .join(', ')}
                          >
                            +
                            {slide.alterations.length - 3}
                            {' '}
                            more
                          </CustomTypography>
                        )}
                        className={classes.chip}
                      />
                    </>
                  ) : (
                    slide.alterations.map((a: IMolecularAlterationDetail) => (
                      <SlideMolecularAlterationChip
                        key={a.id}
                        data={a}
                      />
                    ))
                  )}
                </Box>
              </Box>
            )}
          </Box>
        ))}
        <Box
          key="clinical-information-slide"
          className={clsx({
            [classes.slide]: true,
            [classes.slideSelected]: selectedSlide === 'DISCUSSION',
          })}
          onClick={(): void => setSelectedSlide('DISCUSSION')}
        >
          <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
            Discussion
          </CustomTypography>
        </Box>
      </Box>
      {selectedSlide === 'CLINICAL_INFORMATION' && clinicalVersion && (
        <ArchiveClinicalInformationModal
          open={selectedSlide === 'CLINICAL_INFORMATION'}
          onClose={(): void => setSelectedSlide(undefined)}
          clinicalVersion={clinicalVersion}
        />
      )}
      {selectedSlide === 'MOLECULAR_FINDINGS' && clinicalVersion && (
        <DndProvider backend={HTML5Backend}>
          <ArchiveMolecularFindingsModal
            open={selectedSlide === 'MOLECULAR_FINDINGS'}
            onClose={(): void => setSelectedSlide(undefined)}
            clinicalVersion={clinicalVersion}
          />
        </DndProvider>
      )}
      {selectedSlide && typeof selectedSlide !== 'string' && (
        <ArchiveSlideModal
          slide={selectedSlide}
          open={Boolean(selectedSlide)}
          onClose={(): void => setSelectedSlide(undefined)}
        />
      )}
      {selectedSlide === 'DISCUSSION' && clinicalVersion && (
        <ArchiveDiscussionModal
          open={selectedSlide === 'DISCUSSION'}
          onClose={(): void => setSelectedSlide(undefined)}
          clinicalVersion={clinicalVersion}
        />
      )}
    </>
  );
}
