import { chipColours, corePalette } from '@/themes/colours';
import {
  Box,
  Card, CardActionArea,
  styled, Typography,
} from '@mui/material';

export const CardWrapper = styled(Card)({
  display: 'flex',
  width: '318px',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'stretch',
  height: '100%',

  borderRadius: '8px',
  outline: `1px solid ${corePalette.grey50}`,
  backgroundColor: corePalette.white,
  boxShadow: '0px 8px 12px 0px rgba(18, 47, 92, 0.10)',

  '&:hover': {
    outline: `1.5px solid ${corePalette.green150}`,
    boxShadow: '0px 8px 12px 0px rgba(14, 201, 113, 0.10)',
  },
});

export const CardContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '100%',
  width: '100%',
  padding: '16px',
});

export const CustomCardActionArea = styled(CardActionArea)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '100%',
  fontFamily: 'inherit',
});

export const GeneCountBadge = styled(Box)({
  height: '24px',
  borderRadius: '24px',
  backgroundColor: chipColours.chipGreyBg,
  display: 'flex',
  alignItems: 'center',
  padding: '4px 12px 4px 8px',
  minWidth: 'fit-content',
});

export const GeneMatchBadge = styled(Box)({
  backgroundColor: corePalette.green10,
  borderRadius: '24px',
  height: '25px',
  padding: '4px 12px 4px 10px',
  display: 'inline-flex',
  justifyContent: 'center',
  width: 'fit-content',
  marginLeft: 'calc(100% - 95px)',
  alignItems: 'center',
});

export const VersionWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
});

export const VersionText = styled(Typography)({
  color: corePalette.grey200,
  fontFamily: 'Roboto',
  fontSize: '13px',
  fontWeight: '700',
  textTransform: 'uppercase',
});

export const ViewLinkWrapper = styled(Box)({
  borderTop: `1px solid ${corePalette.grey50}`,
  display: 'flex',
  padding: '12px 16px',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '4px',
  alignSelf: 'normal',
  color: corePalette.green150,
});
