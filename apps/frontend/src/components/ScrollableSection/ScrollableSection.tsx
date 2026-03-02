import clsx from 'clsx';
import SimpleBar, { Props as SimpleBarProps } from 'simplebar-react';

import { makeStyles } from '@mui/styles';
import { CSSProperties, type JSX } from 'react';

const useStyles = makeStyles({
  root: {
    '&::-webkit-scrollbar': {
      '-webkit-appearance': 'none',
      '&:vertical': {
        width: '11px',
      },
      '&:horizontal': {
        height: '11px',
      },
    },

    '&::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      border: '2px solid white', /* should match background, can't be transparent */
      backgroundColor: 'rgba(0, 0, 0, .5)',
      color: 'green',
    },
  },
});

export interface IScrollableSectionProps extends SimpleBarProps {
  styleClassOveride?: string;
  className?: string;
  style?: CSSProperties;
}

export function ScrollableSection({
  children,
  styleClassOveride,
  className,
  style,
  ...rest
}: IScrollableSectionProps): JSX.Element {
  const classes = useStyles();

  return (
    <SimpleBar
      style={style}
      className={clsx(styleClassOveride || classes.root, className)}
      {...rest}
    >
      {children as React.ReactNode}
    </SimpleBar>
  );
}
