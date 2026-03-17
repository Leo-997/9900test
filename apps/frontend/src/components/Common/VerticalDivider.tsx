import { Divider, DividerProps } from '@mui/material';

import type { JSX } from "react";

export default function VerticalDivider(props: DividerProps): JSX.Element {
  return (
    <Divider
      orientation="vertical"
      style={{
        height: '30px',
        margin: '5px 8px',
        background: '#ECF0F3',
      }}
      {...props}
    />
  );
}
