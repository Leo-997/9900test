import { ISampleCorrectionFlag } from '@/types/Corrections.types';
import { FlagStatus } from '../../components/ValidationStatusBanner';

const getCorrectionFlagStatus = (
  flags: ISampleCorrectionFlag[],
  curationStatus: string,
): FlagStatus => {
  const status = curationStatus === 'Upcoming'
    || curationStatus === 'Ready to Start';
  const totalCorrections: number = flags.length;
  const totalCorrected: number = flags.filter((c) => c.isCorrected).length;
  const isAllCorrected: boolean = totalCorrections > 0 && totalCorrections === totalCorrected;

  if (totalCorrections === 0) {
    return status ? 'NO_FLAGS_YET' : undefined;
  } if (isAllCorrected) {
    return status ? 'FLAGS_ALL_CORRECTED' : undefined;
  }
  return 'FLAGS_NOT_CORRECTED';
};

export default getCorrectionFlagStatus;
