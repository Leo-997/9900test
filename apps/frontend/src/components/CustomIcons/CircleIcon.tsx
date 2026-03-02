import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

type GeneIconProps = {
  svgProps?: SvgIconProps;
  text?: string;
  textColor?: string;
  textSize?: string | number;
  iconColor?: string;
  height?: number | string;
  width?: number | string;
  margin?: string;
};

export default function CircleIcon({
  svgProps,
  text,
  textColor,
  textSize = "0.6rem",
  iconColor,
  height,
  width,
  margin,
}: GeneIconProps) {
  return (
    <SvgIcon
      style={{ height, width, margin, color: iconColor }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g>
        <rect x="5" y="5" width="50" height="50" rx="25" />
        {text && (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            color={textColor}
            fontSize={textSize}
            spacing={0.15}
          >
            {text}
          </text>
        )}
      </g>
    </SvgIcon>
  );
}
