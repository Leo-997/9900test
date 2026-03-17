import { Inframe } from '../../types/Common.types';

export function mapToReadingFrame(inframe: Inframe): 'Out of frame' | 'In frame' | 'Unknown' | 'N/A' {
  if (inframe) {
    const chars = inframe.split('');
    const numUnderscores = chars.filter((c) => c === '-').length;
    const numNonUnderscores = chars.filter((c) => c !== '-').length;

    // if inframe is no or something like W-R-, W-, W-P- etc, it is considered out of frame
    // if it is something like WR-, WRP, W, W-R etc it is in frame
    if (inframe === 'N/A') return 'N/A';

    if (
      inframe.toLowerCase() === 'no'
      || numNonUnderscores === numUnderscores
    ) {
      return 'Out of frame';
    }

    return 'In frame';
  }
  return 'Unknown';
}

export function getInframeLegend(inframe: Inframe): string[] {
  const legend: string[] = [];

  if (inframe === null || inframe === 'No') {
    return [];
  }

  const chars = inframe.split('');
  /*
    W => WGS; R => RNA; P => panel
    W- => Out of frame WGS; R- => Out of frame RNA; P => In frame Panel
    If the character is missing, there is no evidence.
    eg: WR- => WGS is inframe, RNA is out of frame, panel has no evidence
    Loop over all the characters, if we see any of the letters we check the next character
    to determine whether it is in or out of frame.
  */
  for (const [index, char] of chars.entries()) {
    if (char !== '-') {
      let string = '';
      if (char === 'W') {
        string = 'WGS:';
      }
      if (char === 'R') {
        string = 'RNA:';
      }
      if (char === 'P') {
        string = 'Panel:';
      }
      if (chars[index + 1] && chars[index + 1] === '-') {
        legend.push(`${string} Out of frame`);
      } else {
        legend.push(`${string} In frame`);
      }
    }
  }

  return legend;
}
