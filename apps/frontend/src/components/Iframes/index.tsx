import { ReactElement, useState } from 'react';
import Iframe from 'react-iframe';
import { createStyles, makeStyles } from '@mui/styles';
import { IFRAME } from '../../types/Common.types';
import LoadingAnimation from '../Animations/LoadingAnimation';
import { ISelectOption } from '../../types/misc.types';

interface IStyleProps {
  loaded: boolean;
}

const useStyles = makeStyles(() => createStyles({
  frame: {
    position: 'relative',
    display: 'block',
    border: 'none',
    opacity: (props: IStyleProps) => (props.loaded ? 1 : 0),

    '& *': {
      overflow: (props: IStyleProps) => (props.loaded ? 'auto' : 'hidden'),
    },
  },
  animation: {
    position: 'absolute',
    top: '50%',
    width: '100%',
  },
}));

type Params = {
  cosmic?: string;
  clinvar?: string;
  gnomad?: string;
  geneIds?: ISelectOption<number>[];
};

interface IProps {
  baseUrl: string;
  params?: Params;
  type: string;
}

export function IframeComponent({
  baseUrl,
  params,
  type,
}: IProps): ReactElement<any> {
  const [loaded, setLoaded] = useState<boolean>(false);
  const classes = useStyles({ loaded });

  let URL = '';
  if (type === IFRAME.COSMIC) {
    URL = baseUrl + params?.cosmic;
  } else if (type === IFRAME.CLINVAR) {
    URL = baseUrl + params?.clinvar;
  } else if (type === IFRAME.GNOMAD) {
    if (params?.geneIds) {
      URL = `${baseUrl}/gene/${params?.geneIds[0].name}?dataset=gnomad_r3`;
    }
  }

  return (
    <div style={{ height: '71vh', position: 'relative' }}>
      <Iframe
        url={URL}
        width="100%"
        className={classes.frame}
        height="100%"
        onLoad={(): void => setLoaded(true)}
      />
      {!loaded && (
        <div className={classes.animation}>
          <LoadingAnimation />
        </div>
      )}
    </div>
  );
}
