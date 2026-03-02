import { useClinical } from '@/contexts/ClinicalContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { Views } from '@/types/MTB/MTB.types';
import { Box, styled, Tooltip } from '@mui/material';
import { ReactNode, type JSX } from 'react';

interface IStyleProps {
  value?: Views | string;
  activeView: Views;
  variant?: 'solid' | 'outline';
  isCustomSlide: boolean;
  disabled: boolean;
}

const Root = styled(Box)<IStyleProps>(({
  theme,
  value,
  activeView,
  variant,
  isCustomSlide,
  disabled,
}) => {
  let border = `1px solid ${theme.colours.core.grey50}`;
  let backgroundColor = variant === 'solid' ? theme.colours.core.grey10 : 'none';

  if (activeView === value) {
    border = `4px solid ${corePalette.yellow150}`;
    backgroundColor = theme.colours.core.grey10;
  }

  return {
    width: 'fit-content',
    minWidth: '68px',
    height: '52px',
    borderRadius: '4px',
    boxSizing: 'border-box',
    cursor: disabled ? 'default' : 'pointer',
    backgroundColor,
    border,

    display: 'flex',
    flexDirection: 'column',
    justifyContent: isCustomSlide ? 'flex-end' : 'center',
    alignItems: isCustomSlide ? 'flex-end' : 'center',

    transition: 'border-color 0.7s cubic-bezier(.19, 1, .22, 1)',

    '&:hover': {
      border: activeView !== value ? `1px solid ${theme.colours.core.offBlack100}` : border,
    },
  };
});

interface IProps {
  value?: Views | string;
  slideTitle: string;
  variant?: 'solid' | 'outline',
  onClick: () => void;
  isCustomSlide?: boolean;
  children: ReactNode;
}

export default function PresentationIndexBarSlide({
  value,
  slideTitle,
  variant = 'solid',
  onClick,
  isCustomSlide = false,
  children,
}: IProps): JSX.Element {
  const {
    activeView,
  } = useClinical();

  const canViewSlide = useIsUserAuthorised('clinical.sample.read');

  return (
    <Tooltip
      title={slideTitle}
      placement="top"
    >
      {/* eslint-disable-next-line max-len */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <Root
        value={value}
        activeView={activeView}
        variant={variant}
        isCustomSlide={isCustomSlide}
        disabled={!canViewSlide}
        onClick={canViewSlide ? onClick : undefined}
      >
        {children}
      </Root>
    </Tooltip>
  );
}
