import { corePalette } from '@/themes/colours';
import { Box, styled } from '@mui/material';
import { ReactNode, type JSX } from 'react';
import CustomTypography from '../Common/Typography';

interface IProps {
  isActive: boolean
}

const Root = styled(Box)<IProps>(({ theme, isActive }) => ({
  textTransform: 'none',
  padding: '16px',
  minHeight: '76px',
  borderRadius: '8px',
  backgroundColor: theme.colours.core.white,
  width: '100%',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '&:hover': {
    backgroundColor: isActive ? theme.colours.core.white : theme.colours.core.grey30,
    cursor: isActive ? 'default' : 'pointer',
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& .MuiButton-label': {
    flexDirection: 'column',
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& > span > p': {
    width: '100%',
  },
}));

interface IItemButtonProps {
  mainText: ReactNode;
  subText?: ReactNode;
  isActive?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  additionalContent?: ReactNode;
  handleClick?: () => void;
  overrideClassName?: string;
  disabled?: boolean;
}

export default function ItemButton({
  mainText,
  subText,
  isActive = false,
  startIcon,
  endIcon,
  additionalContent,
  handleClick,
  overrideClassName,
  disabled = false,
}: IItemButtonProps): JSX.Element {
  return (
    <Root
      isActive={isActive}
      className={overrideClassName}
      onClick={handleClick}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      sx={{
        border: isActive ? `1px solid ${corePalette.green150}` : `1px solid ${corePalette.grey50}`,
        ...(disabled ? {
          cursor: 'default',
          pointerEvents: 'none',
          opacity: 0.6,
        } : {}),
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        minWidth="100%"
        justifyContent="space-between"
      >
        {startIcon && (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            style={{ padding: startIcon ? '0px 16px' : undefined }}
          >
            {startIcon}
          </Box>
        )}
        <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%">
          {typeof mainText === 'string' || typeof mainText === 'number' ? (
            <CustomTypography truncate variant="h5" fontWeight="medium" style={{ width: '100%' }}>
              {mainText}
            </CustomTypography>
          ) : (
            mainText
          )}
          {typeof subText === 'string' || typeof subText === 'number' ? (
            <CustomTypography variant="bodySmall" style={{ color: '#8292A6' }}>
              {subText}
            </CustomTypography>
          ) : subText}
        </Box>
        {endIcon}
      </Box>
      {additionalContent && (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          minWidth="100%"
        >
          {additionalContent}
        </Box>
      )}
    </Root>
  );
}
