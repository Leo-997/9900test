import { corePalette } from '@/themes/colours';
import { SvgIconProps } from '@mui/material';

import type { JSX } from "react";

interface IProps {
  svgProps?: SvgIconProps;
}

function SwitchCheckedIcon({ svgProps }: IProps): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.75847 4.21301L5.90909 8.06239L4.24153 6.39483C3.95751 6.11081 3.49703 6.11081 3.21301 6.39483C2.929 6.67885 2.929 7.13933 3.21301 7.42335L5.39483 9.60517C5.67885 9.88919 6.13933 9.88919 6.42335 9.60517L10.787 5.24153C11.071 4.95751 11.071 4.49703 10.787 4.21301C10.503 3.929 10.0425 3.929 9.75847 4.21301Z"
        fill={corePalette.white}
      />
    </svg>
  );
}

export default SwitchCheckedIcon;
