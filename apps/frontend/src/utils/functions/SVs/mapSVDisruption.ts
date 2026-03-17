export const mapSVDisruption = (
  value: string,
): string | undefined => {
  switch (value) {
    case 'Start':
      return 'Start gene disrupted';

    case 'End':
      return 'End gene disrupted';

    case 'Both':
      return 'Both genes disrupted';

    case 'Yes':
      return 'Disrupted';

    default:
      return undefined;
  }
};
