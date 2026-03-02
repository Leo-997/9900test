import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

type GeneIconProps = {
  svgProps?: SvgIconProps;
  text?: string;
  textColor?: string;
  iconColor?: string;
  height?: number;
  width?: number;
};

export default function SquareIcon({
  svgProps,
  text,
  textColor,
  iconColor,
  height,
  width,
}: GeneIconProps) {
  return (
    <SvgIcon
      style={{ height, width, color: iconColor }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g>
        <rect x="5" y="5" width="50" height="50" rx="8" />
        {text && (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            color={textColor}
            fontSize={20}
            spacing={0.15}
          >
            {text}
          </text>
        )}
      </g>
    </SvgIcon>
  );
}
