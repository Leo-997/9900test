import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

type GeneIconProps = {
  className?: string;
  svgProps?: SvgIconProps;
  text?: string;
  textColor?: string;
  iconColor?: string;
  height?: number;
  width?: number;
};

export default function DiamondIcon({
  className,
  svgProps,
  text,
  textColor,
  iconColor,
  height,
  width,
}: GeneIconProps) {
  return (
    <SvgIcon
      className={className}
      style={{ height, width, color: iconColor }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g>
        <rect
          x="30"
          y="-2"
          width="45"
          height="45"
          rx="8"
          transform="rotate(45 30 -2)"
        />
        <SvgIcon
          style={{ color:textColor }}
        >
          {text && (
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              color={textColor}
              fontSize={"0.5rem"}
              spacing={0.15}
            >
              {text}
            </text>
          )}
        </SvgIcon>
      </g>
    </SvgIcon>
  );
}
