import { Box, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ReactNode, type JSX } from 'react';
import { toFixed } from '@/utils/math/toFixed';
import { corePalette } from '@/themes/colours';
import CustomTypography from '@/components/Common/Typography';
import { useClinical } from '../../../../../contexts/ClinicalContext';

interface IStyleProps {
  isPresentationMode: boolean;
  baseScreenSize: number;
  scale: number;
}

const Root = styled(Box)<IStyleProps>(({
  theme,
  isPresentationMode,
  baseScreenSize,
  scale,
}) => ({
  position: 'relative',
  width: '80%',
  minHeight: '780px',
  minWidth: '1280px',
  maxWidth: '2560px',
  margin: '0 auto',
  backgroundColor: theme.colours.core.white,
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 'max(3%, 45px)',
  ...(
    isPresentationMode && {
      borderRadius: '0px',
      boxShadow: '0px 3px 21px rgba(19, 81, 150, 0.21)',
      minHeight: '100vh',
      width: '100vw',
      '& .MuiTypography-h1': {
        fontSize: `calc(min(max(${toFixed((60 / baseScreenSize) * 100, 2)}vw, 53px), 93px) * ${scale}) !important`,
        lineHeight: '1.2em !important',
      },
      '& .MuiTypography-h2': {
        fontSize: `calc(min(max(${toFixed((48 / baseScreenSize) * 100, 2)}vw, 43px), 75px) * ${scale}) !important`,
        lineHeight: '1.4em !important',
      },
      '& .MuiTypography-h3': {
        fontSize: `calc(min(max(${toFixed((34 / baseScreenSize) * 100, 2)}vw, 30px), 53px) * ${scale}) !important`,
        lineHeight: '1.4em !important',
      },
      '& .MuiTypography-h4': {
        fontSize: `calc(min(max(${toFixed((24 / baseScreenSize) * 100, 2)}vw, 21px), 37px) * ${scale}) !important`,
        lineHeight: '1.4em !important',
      },
      '& .MuiTypography-h5, .MuiTypography-titleRegular': {
        fontSize: `calc(min(max(${toFixed((20 / baseScreenSize) * 100, 2)}vw, 18px), 31px) * ${scale}) !important`,
        lineHeight: '1.5em !important',
      },
      '& .MuiTypography-h6': {
        fontSize: `calc(min(max(${toFixed((16 / baseScreenSize) * 100, 2)}vw, 14px), 25px) * ${scale}) !important`,
        lineHeight: '1.5em !important',
      },
      '& .MuiTypography-bodyRegular,.typography-bodyDefault,.MuiTypography-body1': {
        fontSize: `calc(min(max(${toFixed((16 / baseScreenSize) * 100, 2)}vw, 14px), 25px) * ${scale}) !important`,
        lineHeight: '1.5em !important',
      },
      '& .MuiTypography-bodySmall,.MuiTypography-body2': {
        fontSize: `calc(min(max(${toFixed((14 / baseScreenSize) * 100, 2)}vw, 12px), 22px) * ${scale}) !important`,
        lineHeight: '1.4em !important',
      },
      '& .MuiTypography-label': {
        fontSize: `calc(min(max(${toFixed((11 / baseScreenSize) * 100, 2)}vw, 10px), 17px) * ${scale}) !important`,
        lineHeight: '1.45em !important',
      },
    }
  ),
}));

const useStyles = makeStyles(() => ({
  footer: {
    position: 'absolute',
    bottom: '0px',
    backgroundColor: '#FFFFFF',
    padding: '1% 0px',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0px 0px 8px 8px',
    width: '100%',
  },
  footerDynamic: {
    borderRadius: '0px',
  },
}));

interface IProps {
  children: ReactNode;
  className?: string;
}

export default function SlideBase({
  children,
  className,
}: IProps): JSX.Element {
  const { isPresentationMode, clinicalVersion } = useClinical();
  const classes = useStyles();

  return (
    <Root
      className={className}
      isPresentationMode={isPresentationMode}
      baseScreenSize={1368}
      scale={isPresentationMode ? clinicalVersion.presentationModeScale / 100 : 1}
    >
      {children}
      <Box
        // slide footer class is used for MTB export
        className={clsx({
          [classes.footer]: true,
          [classes.footerDynamic]: isPresentationMode,
        }, 'slide-footer')}
      >
        <CustomTypography variant="bodySmall" color={corePalette.grey100} textAlign="center">
          The information contained in these slides is provided for CLINICAL RESEARCH USE ONLY.
          This document must not be distributed external to the ZERO2 MTB.
        </CustomTypography>
      </Box>
    </Root>
  );
}
