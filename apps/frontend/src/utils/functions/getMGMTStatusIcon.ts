import { corePalette } from '@/themes/colours';

export function getMGMTStatusBackgroundColour(
  status?: string,
  opaque?: boolean,
): string {
  const colours: Record<string, string> = {
    unmethylated: corePalette.green50,
    ambiguous: corePalette.offBlack100,
    methylated: corePalette.red50,
  };

  const statusKey = status?.toLowerCase() ?? '';
  const colour = colours[statusKey] ?? corePalette.offBlack100;
  const alpha = opaque ? '60' : '';
  return `${colour}${alpha}`;
}

export function getMGMTStatusTextColour(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'unmethylated':
    case 'ambiguous':
      return corePalette.offBlack100;
    case 'methylated':
      return corePalette.white;
    default:
      return corePalette.offBlack100;
  }
}

export function getMGMTStatusText(status?: string): string {
  if (
    status && (
      status.toLowerCase() !== 'unknown'
    && status.toLowerCase() !== '-')
  ) {
    return status[0].toUpperCase();
  }

  return '';
}
