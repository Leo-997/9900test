import { PathClass } from '../../types/Common.types';
import HexagonIcon from './HexagonIcon';
import CircleIcon from './CircleIcon';
import DiamondIcon from './DiamondIcon';
import SquareIcon from './SquareIcon';

import type { JSX } from "react";

interface IProps {
  text?: string
  textColor?: string;
  height?: number;
  width?: number;
  iconColor?: string;
  pathclass?: PathClass | null;
}
export default function PathclassIcon({
  text,
  textColor,
  height,
  width,
  pathclass,
  iconColor = '#D0D9E2',
}: IProps): JSX.Element {
  if (pathclass?.startsWith('C5') || pathclass?.startsWith('C4')) {
    return (
      <HexagonIcon
        text={text}
        textColor={textColor}
        iconColor={iconColor}
        height={height}
        width={width}
      />
    );
  } if (pathclass?.startsWith('C3') || pathclass?.startsWith('GUS')) {
    return (
      <SquareIcon
        text={text}
        textColor={textColor}
        iconColor={iconColor}
        height={height}
        width={width}
      />
    );
  } if (
    pathclass?.startsWith('C2')
    || pathclass?.startsWith('C1')
    || pathclass?.startsWith('False Positive')
    || pathclass?.startsWith('Unclassified')
  ) {
    return (
      <CircleIcon
        text={text}
        textColor={textColor}
        iconColor={iconColor}
        height={height}
        width={width}
        textSize={20}
      />
    );
  }
  return (
    <DiamondIcon
      text={text}
      textColor={textColor}
      iconColor={iconColor}
      height={height}
      width={width}
    />
  );
}
