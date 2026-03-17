import { Typography as MuiTypography, Tooltip, TypographyProps } from '@mui/material';
import {
  ReactNode, useRef, useState, type JSX,
} from 'react';

export interface IProps extends TypographyProps {
  truncate?: boolean;
  tooltipText?: ReactNode;
}

export default function CustomTypography({
  truncate,
  tooltipText,
  className,
  sx,
  ...props
}: IProps): JSX.Element {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const textElementRef = useRef<HTMLSpanElement | null>(null);

  const noWrap = truncate ?? false;

  const onMouseEnter = (event: React.MouseEvent<HTMLSpanElement>): void => {
    const el = event.currentTarget;
    if (!el) return;
    if (el.parentElement) {
      const { width: parentWidth } = el.parentElement.getBoundingClientRect();
      let compare = false;
      if (el.firstChild?.nodeType === Node.TEXT_NODE) {
        const range = document.createRange();
        range.selectNodeContents(el.firstChild);
        const rects = range.getBoundingClientRect();
        compare = rects.width > parentWidth;
      } else if (el.firstElementChild) {
        const { width } = el.firstElementChild.getBoundingClientRect();
        compare = width > parentWidth;
      }
      setShowTooltip(compare);
    }
  };

  const onMouseLeave = (): void => setShowTooltip(false);

  return (
    <Tooltip
      title={tooltipText || textElementRef.current?.innerText || ''}
      disableHoverListener={!tooltipText && (!noWrap)}
      disableFocusListener
      disableTouchListener
      placement="bottom"
      open={showTooltip}
    >
      <MuiTypography
        ref={textElementRef}
        noWrap={noWrap}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          maxWidth: truncate ? '100%' : 'inherit',
          ...sx,
        }}
        {...props}
      />
    </Tooltip>
  );
}
