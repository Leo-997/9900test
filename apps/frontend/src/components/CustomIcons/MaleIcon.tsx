import { corePalette } from '@/themes/colours';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

import type { JSX } from "react";

interface IProps {
  symbol?: string;
  background?: string;
  size?: string;
  props?: SvgIconProps;
}

function MaleIcon({
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
          d="M17.9925 4.50814C17.986 4.45787 17.9749 4.40944 17.9566 4.36401C17.956 4.36287 17.956 4.36131 17.9557 4.35988C17.9557 4.3596 17.9554 4.35931 17.9551 4.35903C17.9349 4.31118 17.9073 4.26774 17.8761 4.22744C17.8684 4.2179 17.8609 4.2085 17.8527 4.19952C17.8194 4.16193 17.7832 4.12718 17.7412 4.09884C17.7401 4.09798 17.7387 4.0977 17.7375 4.09684C17.6969 4.07007 17.6521 4.04985 17.6051 4.03389C17.5934 4.02976 17.582 4.0262 17.57 4.02307C17.5208 4.00968 17.4701 4 17.4167 4H13.3333C13.0113 4 12.75 4.26133 12.75 4.58333C12.75 4.90533 13.0113 5.16667 13.3333 5.16667H16.0082L12.5266 8.64829C11.5981 7.90574 10.4551 7.5 9.25 7.5C6.35527 7.5 4 9.85527 4 12.75C4 15.6447 6.35527 18 9.25 18C12.1447 18 14.5 15.6447 14.5 12.75C14.5 11.5455 14.0945 10.4027 13.3514 9.47345L16.8333 5.99154V8.66667C16.8333 8.98867 17.0947 9.25 17.4167 9.25C17.7387 9.25 18 8.98867 18 8.66667V4.58333C18 4.57109 17.9972 4.55941 17.9964 4.54744C17.9956 4.53406 17.9942 4.52124 17.9925 4.50814ZM9.25 16.8333C6.99827 16.8333 5.16667 15.0017 5.16667 12.75C5.16667 10.4983 6.99827 8.66667 9.25 8.66667C10.3402 8.66667 11.3666 9.09106 12.1383 9.86011C12.9089 10.6334 13.3333 11.6598 13.3333 12.75C13.3333 15.0017 11.5017 16.8333 9.25 16.8333Z"
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

export default MaleIcon;
