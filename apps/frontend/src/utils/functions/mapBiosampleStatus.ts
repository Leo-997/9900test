import { BiosampleStatus } from '../../types/Samples/Sample.types';

export function mapBiosampleStatus(type: BiosampleStatus): string {
  switch (type) {
    case 'tumour':
      return 'Tumour';
    case 'normal':
      return 'Patient Germline';
    case 'donor':
      return 'Donor Germline';
    default:
      return 'Unknown';
  }
}
