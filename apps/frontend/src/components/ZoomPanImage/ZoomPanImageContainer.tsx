import { createStyles, makeStyles } from '@mui/styles';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { ZoomWrapper } from './ZoomWrapper';

import type { JSX } from "react";

// type ZoomWrapper = {
//   state: any;
//   zoomIn: () => void;
//   zoomOut: () => void;
// };

const useStyles = makeStyles(() => createStyles({
  zoomWrapper: {
    height: '100%',
    width: 'auto',
  },
  imgDefault: {
    height: '100%',
    width: '100%',
    objectFit: 'contain',
  },
}));

interface IProps {
  title: string;
  url: string | string[];
}

export default function ZoomPanImageContainer({
  title,
  url,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    Array.isArray(url) ? (
      <>
        {url.map((u) => (
          <TransformWrapper key={u} initialScale={1} centerOnInit>
            <ZoomWrapper>
              <TransformComponent
                contentStyle={{
                  height: url?.length ? `calc((100vh - 100px) / ${url?.length})` : '100vh',
                  width: 'auto',
                }}
                wrapperStyle={{
                  height: url?.length ? `calc((100vh - 100px) / ${url?.length})` : '100vh',
                  width: 'auto',
                }}
              >
                <img className={classes.imgDefault} src={u} alt={title} />
              </TransformComponent>
            </ZoomWrapper>
          </TransformWrapper>
        ))}
      </>
    ) : (
      <TransformWrapper initialScale={1} centerOnInit>
        <ZoomWrapper>
          <TransformComponent
            contentClass={classes.zoomWrapper}
            wrapperClass={classes.zoomWrapper}
          >
            <img className={classes.imgDefault} src={url} alt={title} />
          </TransformComponent>
        </ZoomWrapper>
      </TransformWrapper>
    )
  );
}
