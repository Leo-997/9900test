export const strToBool = (
  s: string | undefined | null,
): boolean | null => {
  if (s) {
    if (s.toLowerCase().startsWith('y')) {
      return true;
    }
    if (s.toLowerCase().startsWith('n')) {
      return false;
    }
    return null;
  }
  return null;
};

export const boolToStr = (
  b: boolean | undefined | null,
): 'Yes' | 'No' | '' => {
  if (b !== undefined && b !== null) {
    if (b === true) {
      return 'Yes';
    }
    if (b === false) {
      return 'No';
    }
    return '';
  }
  return '';
};
