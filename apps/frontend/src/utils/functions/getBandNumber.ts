import { Arm } from '@/types/Cytogenetics.types';

export function getBandNumber(cytoband: string, arm: Arm): number {
  return Number(cytoband.split(arm)[1]);
}
