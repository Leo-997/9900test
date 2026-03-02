import { corePalette } from '@/themes/colours';
import { CSSProperties, type JSX } from 'react';

interface INivoTooltipWrapperProps {
  title?: string;
  renderContent: () => JSX.Element;
  width?: number;
  className?: string;
  style?: CSSProperties;
}

export default function NivoTooltipWrapper({
  title,
  renderContent,
  width,
  className,
  style,
}: INivoTooltipWrapperProps): JSX.Element {
  const baseStyle: CSSProperties = {
    background: `${corePalette.white}`,
    padding: '10px',
    border: `1px solid ${corePalette.grey100}`,
    borderRadius: '5px',
    fontSize: '12px',
    boxShadow: `0 2px 5px ${corePalette.offBlack200}33`,
    width: width ? `${width}px` : 'auto',
    position: 'relative',
    zIndex: 10,
  };

  return (
    <div
      className={className}
      style={{ ...baseStyle, ...style }}
    >
      {title && <strong>{title}</strong>}
      {renderContent()}
    </div>
  );
}
