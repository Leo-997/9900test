import { IChipColours, ICorePalette } from '../types/theme.types';

export const corePalette: ICorePalette = {
  // Special
  blank: 'transparent',

  // Neutrals
  offBlack200: '#030313',
  offBlack100: '#022034',
  grey200: '#273957',
  grey100: '#596983',
  grey50: '#D0D9E2',
  grey30: '#ECF0F3',
  grey10: '#FAFBFC',
  white: '#FFFFFF',

  // Blue
  blue300: '#082F7E',
  blue200: '#004EB4',
  blue150: '#016EE9',
  blue100: '#1E86FC',
  blue50: '#75B6FF',
  blue30: '#BBDEFF',
  blue10: '#EDF6FF',

  // Turquoise
  turquoise300: '#053835',
  turquoise200: '#075C57',
  turquoise150: '#08827A',
  turquoise100: '#27B8AF',
  turquoise50: '#43DED3',
  turquoise30: '#7EF2EB',
  turquoise10: '#D7FAF8',

  // Green
  green300: '#015831',
  green200: '#00723F',
  green150: '#00AB59',
  green100: '#0EC971',
  green50: '#40E58D',
  green30: '#84FFBE',
  green10: '#D1FCE6',

  // Red
  red300: '#B00047',
  red200: '#DD0951',
  red150: '#EE1A59',
  red100: '#FF2969',
  red50: '#FF5E8E',
  red30: '#FFAAC4',
  red10: '#FEE0E9',

  // Magenta
  magenta300: '#871578',
  magenta200: '#AD239D',
  magenta150: '#CA44BC',
  magenta100: '#E06AD3',
  magenta50: '#EF91E5',
  magenta30: '#F9C1F2',
  magenta10: '#FADEF6',

  // Violet
  violet300: '#271C7A',
  violet200: '#362A93',
  violet150: '#5A4ACF',
  violet100: '#6F60E4',
  violet50: '#9A8DFF',
  violet30: '#D2CCFF',
  violet10: '#ECEAFC',

  // Purple
  purple300: '#45107A',
  purple200: '#6116A9',
  purple150: '#7E2DC9',
  purple100: '#9B51E0',
  purple50: '#B97DF1',
  purple30: '#D8B2FC',
  purple10: '#E9D5FD',

  // Orange
  orange300: '#9C3D07',
  orange200: '#BC4A09',
  orange150: '#E97307',
  orange100: '#F39D41',
  orange50: '#FCB874',
  orange30: '#FCD7B1',
  orange10: '#FFF2E6',

  // Yellow
  yellow300: '#A4821E',
  yellow200: '#DDB418',
  yellow150: '#F8CA19',
  yellow100: '#FAD74B',
  yellow50: '#FFE974',
  yellow30: '#FFF6B2',
  yellow10: '#FFFAE8',

  // Warm Red
  warmRed300: '#8A0116',
  warmRed200: '#B8021D',
  warmRed150: '#E51736',
  warmRed100: '#FC304F',
  warmRed50: '#FC7489',
  warmRed30: '#FCC8D0',
  warmRed10: '#FFE8EB',
};

export const datasetColours: string[] = [
  '#08adbf',
  '#bc4d4c',
  '#91b999',
  '#c98c61',
  '#755ea0',
  '#FFC562',
  '#044b8c',
  '#4FDDC3',
  '#FF6D74',

  // '#E58606',
  // '#5D69B1',
  // '#52BCA3',
  // '#99C945',
  // '#CC61B0',
  // '#24796C',
  // '#DAA51B',
  // '#2F8AC4',
  // '#764E9F',
  // '#ED645A',
  // '#CC3A8E',
  // '#A5AA99',
];

export const datasetColoursSorted: string[] = [
  '#08adbf',
  '#bc4d4c',
  '#91b999',
  '#c98c61',
  '#755ea0',
  '#FFC562',
  '#044b8c',
  '#4FDDC3',
  '#FF6D74',

  // '#A5AA99',
  // '#24796C',
  // '#52BCA3',
  // '#99C945',
  // '#DAA51B',
  // '#E58606',
  // '#ED645A',
  // '#CC3A8E',
  // '#CC61B0',
  // '#764E9F',
  // '#5D69B1',
  // '#2F8AC4',
];

export const chipColours: IChipColours = {
  // Blue
  chipBlueBg: corePalette.blue30,
  chipBlueText: corePalette.blue300,

  // Green
  chipGreenBg: corePalette.green10,
  chipGreenText: corePalette.green300,

  // Grey
  chipGreyBg: corePalette.grey30,
  chipGreyText: corePalette.grey200,

  // Disabled
  chipDisabledBg: corePalette.grey50,
  chipDisabledText: corePalette.grey100,

  // Violet
  chipVioletBg: corePalette.violet30,
  chipVioletText: corePalette.violet200,

  // Purple
  chipPurpleBg: corePalette.purple10,
  chipPurpleText: corePalette.purple200,

  // Magenta
  chipMagentaBg: corePalette.magenta10,
  chipMagentaText: corePalette.magenta200,

  // Red
  chipRedBg: corePalette.red10,
  chipRedText: corePalette.red300,

  // Orange
  chipOrangeBg: corePalette.orange10,
  chipOrangeText: corePalette.orange200,
};

export const significanceColours = {
  // Red
  red100: '#FF2969',
  red70: '#FF477E',
  red50: '#FF5E8E',
  red40: '#FF84A9',
  red30: '#FFAAC4',
  red20: '#FEC9D8',
  red10: '#FEE0E9',
  red0: '#FFF2F6',

  // Neutral
  neutral: '#F0F4F7',

  // Green
  green0: '#E8FFF2',
  green10: '#C9FFE2',
  green20: '#ABFFD2',
  green30: '#84FFBE',
  green40: '#5DFCA8',
  green50: '#40E58D',
  green70: '#16DA7D',
  green100: '#0EC971',

  // Violet
  violet50: '#9A8DFF',
};

export const colorShades = {
  reds: {
    800: {
      backgroundColour: significanceColours.red100,
      colour: corePalette.offBlack200,
    },
    700: {
      backgroundColour: significanceColours.red70,
      colour: corePalette.offBlack200,
    },
    600: {
      backgroundColour: significanceColours.red50,
      colour: corePalette.offBlack200,
    },
    500: {
      backgroundColour: significanceColours.red40,
      colour: corePalette.offBlack100,
    },
    400: {
      backgroundColour: significanceColours.red30,
      colour: corePalette.offBlack100,
    },
    300: {
      backgroundColour: significanceColours.red20,
      colour: corePalette.offBlack100,
    },
    200: {
      backgroundColour: significanceColours.red10,
      colour: corePalette.offBlack100,
    },
    100: {
      backgroundColour: significanceColours.red0,
      colour: corePalette.offBlack100,
    },
  },
  greens: {
    800: {
      backgroundColour: significanceColours.green100,
      colour: corePalette.offBlack200,
    },
    700: {
      backgroundColour: significanceColours.green70,
      colour: corePalette.offBlack200,
    },
    600: {
      backgroundColour: significanceColours.green50,
      colour: corePalette.offBlack200,
    },
    500: {
      backgroundColour: significanceColours.green40,
      colour: corePalette.offBlack100,
    },
    400: {
      backgroundColour: significanceColours.green30,
      colour: corePalette.offBlack100,
    },
    300: {
      backgroundColour: significanceColours.green20,
      colour: corePalette.offBlack100,
    },
    200: {
      backgroundColour: significanceColours.green10,
      colour: corePalette.offBlack100,
    },
    100: {
      backgroundColour: significanceColours.green0,
      colour: corePalette.offBlack100,
    },
  },
  N200: {
    backgroundColour: significanceColours.neutral,
    colour: corePalette.offBlack100,
  },
  V800: {
    backgroundColour: significanceColours.violet50,
    colour: corePalette.white,
  },
};
