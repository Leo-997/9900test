import { Chromosome } from '@/types/Common.types';
import { IArmData } from '@/types/Cytogenetics.types';

export default function isCytoArmLoh(chr: Chromosome, arm: IArmData, isMale = false): boolean {
  return ((chr !== 'chrX' && chr !== 'chrY') || !isMale) && (
    arm.aveMinMinorAlleleCN !== null
    && arm.aveMinMinorAlleleCN < 0.5
  );
}
