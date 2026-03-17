import { IUser } from '@/types/Auth/User.types';
import { CSSProperties } from 'react';

// The below regex extracts the hex values of the user's avatar.
// Searches for at least 2 hex values and at most 3, to accommodate
// for both old and new formats. The delimiter is different too, so
// the split accounts for that as well.
// Old format: '#FFFFFF,#FFFFFF'
// New format: 'colour:#FFFFFF;#FFFFFF;#FFFFFF'
export function getAvatarStyles(
  user?: IUser | null,
  borderStyle = 'solid',
  defaultBackgroundColour = '#FFFFFF',
): CSSProperties {
  if (
    user
    && (
      user.avatar?.includes('colour')
      || user.avatar?.match(/([,;]*#[0-9A-Z]{6}){2,3}/)
    )
  ) {
    const [backgroundColor, border, color] = user.avatar.replace('colour:', '').split(/[,;]/);

    return {
      backgroundColor,
      border: `1px ${borderStyle} ${border}`,
      color: color || '#000000',
    };
  }

  // Default styling
  return {
    backgroundColor: defaultBackgroundColour,
    border: `1px ${borderStyle || 'dashed'} #D0D9E2`,
    color: '#000000',
  };
}
