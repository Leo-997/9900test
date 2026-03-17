import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import VerticalDivider from '@/components/Common/VerticalDivider';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { useClinical } from '@/contexts/ClinicalContext';
import { corePalette } from '@/themes/colours';
import { ISlide } from '@/types/MTB/Slide.types';
import {
  Box, IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ChevronDownIcon, ChevronLeft, ChevronUpIcon, MinusIcon, PlusIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import PresentationIndexBarSlide from './PresentationIndexBarSlide';

const useStyles = makeStyles(() => ({
  root: {
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#FAFBFC',
    boxShadow: '0px -4px 24px 0px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
    transition: 'all 0.7s cubic-bezier(.19, 1, .22, 1)',
    overflow: 'hidden',
  },
  divider: {
    margin: '0px !important',
    height: '48px !important',
    backgroundColor: '#D0D9E2',
  },
  iconButton: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '100px',
    backgroundColor: '#FFFFFF !important',
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.05)',
    right: '16px',
    top: '-20px',
    '&:hover': {
      backgroundColor: '#F5F5F5 !important',
    },
  },
  scrollWrapper: {
    width: 'calc(100% - 200px)',
    height: '100%',
    position: 'relative',
    left: '100px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .simplebar-content': {
      height: '100%',
    },
  },
}));

export function PresentationIndexBar(): JSX.Element {
  const navigate = useNavigate();
  const classes = useStyles();
  const {
    updatePresentationModeScale,
    clinicalVersion,
    slides,
    mtbBaseUrl,
  } = useClinical();

  const [indexShowing, setIndexShowing] = useState<boolean>(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
      position="fixed"
      bottom="0px"
    >
      <IconButton
        className={classes.iconButton}
        onClick={(): void => setIndexShowing((prev) => !prev)}
      >
        {indexShowing ? (
          <ChevronDownIcon />
        ) : (
          <ChevronUpIcon />
        )}
      </IconButton>
      <Box
        className={classes.root}
        style={{
          height: indexShowing ? '72px' : '0px',
          padding: indexShowing ? '8px 16px' : '0px 16px',
        }}
      >
        <CustomButton
          onClick={(): Promise<void> => document.exitFullscreen()}
          label="Back to editing"
          variant="text"
          size="small"
          startIcon={<ChevronLeft />}
          sx={{
            position: 'absolute',
            left: '12px',
          }}
        />
        <ScrollableSection
          className={classes.scrollWrapper}
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            height="100%"
            gap="16px"
            width="100%"
            minWidth="fit-content"
          >
            <PresentationIndexBarSlide
              key="clinical_information"
              value="CLINICAL_INFORMATION"
              slideTitle="Clinical Information"
              onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/CLINICAL_INFORMATION`)}
            >
              <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
                Clinical
              </CustomTypography>
              <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
                Information
              </CustomTypography>
            </PresentationIndexBarSlide>
            <PresentationIndexBarSlide
              key="molecular_findings"
              value="MOLECULAR_FINDINGS"
              slideTitle="Molecular Findings"
              onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/MOLECULAR_FINDINGS`)}
            >
              <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
                Molecular
              </CustomTypography>
              <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
                Findings
              </CustomTypography>
            </PresentationIndexBarSlide>
            <VerticalDivider className={classes.divider} />
            {slides
              .filter((s) => (!s.hidden))
              .map((s: ISlide, index: number) => (
                <PresentationIndexBarSlide
                  key={s.id}
                  value={s.id}
                  slideTitle={s.title || 'Untitled slide'}
                  onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/${s.id}`)}
                  isCustomSlide
                >
                  <CustomTypography
                    variant="bodySmall"
                    sx={{
                      fontSize: '12px',
                      margin: '0 5px 3px 0',
                    }}
                  >
                    {index + 1}
                  </CustomTypography>
                </PresentationIndexBarSlide>
              ))}
            <VerticalDivider className={classes.divider} />
            <PresentationIndexBarSlide
              key="discussion"
              value="DISCUSSION"
              slideTitle="Discussion"
              onClick={(): Promise<void> | void => navigate(`/${mtbBaseUrl}/DISCUSSION`)}
            >
              <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
                Discussion
              </CustomTypography>
            </PresentationIndexBarSlide>
          </Box>
        </ScrollableSection>
        <IconButton
          onClick={(): void => updatePresentationModeScale(-10)}
          disabled={clinicalVersion.presentationModeScale <= 95}
        >
          <MinusIcon
            color={
              clinicalVersion.presentationModeScale <= 95
                ? corePalette.grey50
                : corePalette.offBlack100
            }
          />
        </IconButton>
        <CustomTypography variant="bodySmall">
          {clinicalVersion.presentationModeScale}
          %
        </CustomTypography>
        <IconButton
          onClick={(): void => updatePresentationModeScale(10)}
          disabled={clinicalVersion.presentationModeScale >= 135}
        >
          <PlusIcon
            color={
              clinicalVersion.presentationModeScale >= 135
                ? corePalette.grey50
                : corePalette.offBlack100
            }
          />
        </IconButton>
      </Box>
    </Box>
  );
}
