import { ReactNode, type JSX } from 'react';
import { useControls, useTransformContext } from 'react-zoom-pan-pinch';
import ZoomControllers from './ZoomControllers';

interface IProps {
  children?: ReactNode
}

export function ZoomWrapper({
  children,
}: IProps): JSX.Element {
  const { transformState: state } = useTransformContext();
  const { zoomIn, zoomOut } = useControls();
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {children}
      <ZoomControllers
        scale={state.scale}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </div>
  );
}
