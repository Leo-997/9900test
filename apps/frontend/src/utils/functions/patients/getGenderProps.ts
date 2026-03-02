import { corePalette } from '@/themes/colours';

export const getGenderProps = (
  vitalStatus: string | null,
): {label: string, colour: string, backgroundColour: string } => {
  if (vitalStatus === 'Alive') {
    return {
      label: 'Alive',
      colour: corePalette.green300,
      backgroundColour: corePalette.green10,
    };
  }

  if (vitalStatus === 'Dead') {
    return {
      label: 'Deceased',
      colour: corePalette.grey200,
      backgroundColour: corePalette.grey30,
    };
  }

  return {
    label: 'Unknown',
    colour: corePalette.offBlack100,
    backgroundColour: corePalette.white,
  };
};
