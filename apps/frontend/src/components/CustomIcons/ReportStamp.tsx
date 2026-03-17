import { SvgIcon, SvgIconProps } from '@mui/material';

import type { JSX } from "react";

export default function ReportStamp({ stroke, ...props }: SvgIconProps): JSX.Element {
  return (
    <SvgIcon
      {...props}
      width="145"
      height="201"
      viewBox="0 0 145 201"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="231" cy="-30" r="205.5" stroke={stroke} strokeWidth="51" />
    </SvgIcon>
  );
}
