import { SvgIconProps } from '@mui/material';
import { corePalette } from '../../themes/colours';

import type { JSX } from "react";

interface IProps {
  svgProps?: SvgIconProps;
}

function SwitchUncheckedIcon({ svgProps }: IProps): JSX.Element {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path
        d="M10.1804 4.13766C10.0029 3.96018 9.71621 3.96018 9.53873 4.13766L7.31348 6.35836L5.08822 4.13311C4.91075 3.95563 4.62406 3.95563 4.44658 4.13311C4.26911 4.31058 4.26911 4.59727 4.44658 4.77474L6.67184 7L4.44658 9.22526C4.26911 9.40273 4.26911 9.68942 4.44658 9.86689C4.62406 10.0444 4.91075 10.0444 5.08822 9.86689L7.31348 7.64164L9.53873 9.86689C9.71621 10.0444 10.0029 10.0444 10.1804 9.86689C10.3578 9.68942 10.3578 9.40273 10.1804 9.22526L7.95511 7L10.1804 4.77474C10.3533 4.60182 10.3533 4.31058 10.1804 4.13766V4.13766Z"
        fill={corePalette.white}
      />
    </svg>
  );
}

export default SwitchUncheckedIcon;
