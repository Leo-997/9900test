import { Group } from '@/types/Auth/Group.types';

export function mapGroupName(group: Group | null): string {
  switch (group) {
    case 'CancerGeneticists':
      return 'Cancer Geneticists';
    case 'MolecularOncologists':
      return 'Molecular Oncologists';
    case 'ClinicalFellows':
      return 'ZERO Clinical Fellows';
    case 'MTBChairs':
      return 'MTB Chairs';
    default:
      return group || '';
  }
}
