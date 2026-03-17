import { getGenderProps } from '@/utils/functions/patients/getGenderProps';
import FemaleIcon from '../CustomIcons/FemaleIcon';
import MaleIcon from '../CustomIcons/MaleIcon';

import type { JSX } from "react";

interface IGenderProps {
  vitalStatus: string;
  gender: string;
  size?: string;
}

export default function Gender({
  vitalStatus,
  gender,
  size,
}: IGenderProps): JSX.Element {
  const GenderIcon = gender === 'Male' ? MaleIcon : FemaleIcon;
  const { colour, backgroundColour } = getGenderProps(vitalStatus);

  return (
    <GenderIcon
      size={size}
      symbol={colour}
      background={backgroundColour}
    />
  );
}
