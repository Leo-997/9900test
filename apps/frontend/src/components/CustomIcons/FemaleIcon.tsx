import { corePalette } from '@/themes/colours';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

import type { JSX } from "react";

interface IProps {
  symbol?: string;
  background?: string;
  size?: string;
  props?: SvgIconProps;
}

function FemaleIcon({
  symbol = corePalette.green300,
  background = corePalette.green10,
  size = '22px',
  ...props
}: IProps): JSX.Element {
  return (
    <SvgIcon
      {...props}
      style={{ width: size, height: size }}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="22" height="22" rx="4" fill={background} />
      <g clipPath="url(#clip0)">
        <path
          d="M14.2885 11.9344C16.1018 10.1217 16.1018 7.17224 14.2885 5.35954C12.4752 3.54682 9.52482 3.54682 7.71152 5.35954C5.89824 7.17224 5.89824 10.1217 7.71152 11.9344C8.47906 12.7017 9.45033 13.1441 10.4528 13.2619V14.8183H9.35859C9.05642 14.8183 8.81147 15.0632 8.81147 15.3653C8.81147 15.6674 9.05642 15.9123 9.35859 15.9123H10.4528V17.453C10.4529 17.7551 10.6978 18 11 18C11.3022 18 11.5471 17.7551 11.5471 17.453V15.9123H12.6414C12.9436 15.9123 13.1885 15.6674 13.1885 15.3653C13.1885 15.0632 12.9436 14.8183 12.6414 14.8183H11.5471V13.2619C12.5497 13.1441 13.5209 12.7017 14.2885 11.9344ZM8.48529 11.1609C7.09866 9.77471 7.09866 7.51924 8.48529 6.13304C9.87189 4.74691 12.1281 4.74683 13.5147 6.13304C14.9014 7.51924 14.9014 9.77471 13.5147 11.1609C12.1281 12.5471 9.87192 12.5471 8.48529 11.1609Z"
          fill={symbol}
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect
            width="14"
            height="14"
            fill="white"
            transform="translate(4 4)"
          />
        </clipPath>
      </defs>
    </SvgIcon>
  );
}

export default FemaleIcon;
