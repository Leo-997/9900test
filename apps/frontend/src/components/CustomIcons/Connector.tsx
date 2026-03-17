import { SvgIcon, type SvgIconProps } from '@mui/material';
import type { JSX } from 'react';

export default function ConnectorIcon(props: SvgIconProps): JSX.Element {
  return (
    <SvgIcon
      width="15"
      height="24"
      viewBox="0 0 15 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 0V3.85742C3.00015 5.51415 4.34324 6.85742 6 6.85742H9C10.6568 6.85742 11.9999 5.51415 12 3.85742V0H15V24H12V20.1426C11.9998 18.4859 10.6568 17.1426 9 17.1426H6C4.34324 17.1426 3.00015 18.4859 3 20.1426V24H0V0H3Z" fill="currentColor" />
    </SvgIcon>
  );
}
