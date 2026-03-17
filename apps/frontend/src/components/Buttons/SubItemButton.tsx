import {
  Box,
  lighten, Button as MuiButton, styled,
  Tooltip,
} from '@mui/material';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

interface IStyleProps {
  isActive?: boolean;
  disabled?: boolean;
}

const Button = styled(MuiButton)<IStyleProps>(({ theme, isActive }) => ({
  textTransform: 'none',
  padding: '0',
  height: '40px',
  borderRadius: '8px',
  border: `1px solid ${isActive ? theme.palette.primary.main : theme.colours.core.grey50}`,
  backgroundColor: theme.colours.core.white,
  width: '100%',
  justifyContent: 'space-between',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '&:hover': {
    backgroundColor: theme.colours.core.grey30,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& > span > p': {
    width: '100%',
  },
  '&:disabled': {
    color: lighten(theme.colours.core.offBlack200, 0.65),
    backgroundColor: theme.colours.core.white,
  },
  '&:focus': {
    outline: 'none',
    transition: 'none',
  },
}));

const SubText = styled(CustomTypography)<IStyleProps>(({ theme, disabled }) => ({
  color: disabled ? 'inherit' : theme.colours.core.grey100,
  display: 'flex',
  flexDirection: 'row',
  '&:disabled': {
    color: 'inherit',
  },
}));

interface ISubItemButtonProps {
  mainText: string;
  subText?: string;
  isActive?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  handleClick?: () => void;
  disabled?: boolean;
  tooltipText?: string;
}

export default function SubItemButton({
  mainText,
  subText,
  isActive = false,
  startIcon,
  endIcon,
  handleClick,
  disabled,
  tooltipText,
}: ISubItemButtonProps): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Tooltip
        style={{ width: '100%' }}
        title={tooltipText || ''}
      >
        <span>
          <Button
            onClick={handleClick}
            disabled={disabled}
            isActive={isActive}
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              padding="0px 16px"
            >
              {startIcon}
              <Box
                display="flex"
                flexDirection="row"
              >
                <CustomTypography truncate variant="bodySmall" color="inherit">
                  { mainText }
                </CustomTypography>
                { subText && (
                  <SubText
                    truncate
                    variant="bodySmall"
                    disabled={disabled}
                  >
                    <Box padding="0 4px">•</Box>
                    {subText}
                  </SubText>
                )}
              </Box>
              { endIcon }
            </Box>
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
