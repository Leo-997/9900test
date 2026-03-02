import { useEffect, useState, type JSX } from 'react';
import { Box } from '@mui/material';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { ISlideWithMetadata } from '../../../../../types/MTB/Slide.types';
import ArchivePerSlideSections from './ArchivePerSlideSections';
import MolecularAlteration from '../Slides/MolecularAlteration';
import CustomTypography from '../../../../Common/Typography';

export default function ArchiveAllSlideSections(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { selectedSample } = useMTBArchive();

  const [slides, setSlides] = useState<ISlideWithMetadata[]>([]);

  useEffect(() => {
    if (selectedSample) {
      zeroDashSdk.mtb.slides.getSlidesByVersionId(selectedSample.clinicalVersionId)
        .then(async (resp) => {
          const newSlides = await Promise.all(resp.map(async (s) => ({
            ...s,
            clinicalInfo: await zeroDashSdk.mtb.clinicalInfo.getClinicalInformation(
              selectedSample.clinicalVersionId,
              s.id,
            ),
            germlineSections: await zeroDashSdk.mtb.slides.getSectionsBySlideId(
              selectedSample.clinicalVersionId,
              s.id,
            ),
          })));

          setSlides(newSlides);
        });
    }
  }, [selectedSample, zeroDashSdk.mtb.clinicalInfo, zeroDashSdk.mtb.slides]);

  return (
    <>
      {slides
        .filter((s) => (s.germlineSections?.length || s.clinicalInfo))
        .map((s, index) => (
          <Box
            key={s.id}
            padding="32px 0px"
            paddingTop={index > 0 ? '32px' : 0}
            borderTop={index > 0 ? '1px solid #ECF0F3' : undefined}
            display="flex"
            flexDirection="column"
            gap="16px"
          >
            <CustomTypography variant="label">
              Slide alterations
            </CustomTypography>
            {s.alterations && (
              <Box
                display="flex"
                gap="16px"
                flexWrap="wrap"
              >
                {s.alterations.map((a) => (
                  <MolecularAlteration
                    key={a.id}
                    alteration={a}
                    isOnSlide={false}
                  />
                ))}
              </Box>
            )}
            <ArchivePerSlideSections slideId={s.id} />
          </Box>
        ))}
    </>
  );
}
