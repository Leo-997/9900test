import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

type GeneIconProps = {
  svgProps?: SvgIconProps;
  text?: string;
  textColor?: string;
  iconColor?: string;
  height?: number;
  width?: number;
};

export default function HexagonIcon({
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
        <path d="M25.5 3.59808C28.2846 1.99038 31.7154 1.99038 34.5 3.59808L50.6147 12.9019C53.3993 14.5096 55.1147 17.4808 55.1147 20.6962V39.3038C55.1147 42.5192 53.3993 45.4904 50.6147 47.0981L34.5 56.4019C31.7154 58.0096 28.2846 58.0096 25.5 56.4019L9.38526 47.0981C6.60065 45.4904 4.88526 42.5192 4.88526 39.3038V20.6962C4.88526 17.4808 6.60065 14.5096 9.38526 12.9019L25.5 3.59808Z" />
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
