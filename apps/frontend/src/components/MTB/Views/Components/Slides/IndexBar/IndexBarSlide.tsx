/* eslint-disable max-len */
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
  Box, darken, styled, Tooltip,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { Views } from '../../../../../../types/MTB/MTB.types';

interface IStyleProps {
  value?: Views | string;
  activeView: Views;
  variant?: 'solid' | 'outline';
  isCustomSlide: boolean;
  disabled: boolean;
}

const Root = styled(Box)<IStyleProps>(({
  variant, value, activeView, disabled, isCustomSlide,
}) => {
  let border = variant === 'solid' ? 'none' : `1px dashed ${corePalette.white}`;
  const backgroundColor = variant === 'solid' ? darken(corePalette.grey200, 0.1) : 'none';

  if (activeView === value) {
    border = `4px solid ${corePalette.yellow100}`;
  }

  return {
    width: 'fit-content',
    minWidth: '64px',
    height: '48px',
    borderRadius: '4px',
    boxSizing: 'content-box',
    color: corePalette.white,
    cursor: disabled ? 'default' : 'pointer',
    backgroundColor,
    border,

    display: 'flex',
    flexDirection: 'column',
    justifyContent: isCustomSlide ? 'flex-end' : 'center',
    alignItems: isCustomSlide ? 'flex-end' : 'center',
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

export default function IndexBarSlide({
  value,
  slideTitle,
  variant = 'solid',
  onClick,
  isCustomSlide = false,
  children,
}: IProps): JSX.Element {
  const { activeView } = useClinical();

  const canViewSlide = useIsUserAuthorised('clinical.sample.read');

  return (
    <Tooltip
      title={slideTitle}
      placement="top"
    >
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
