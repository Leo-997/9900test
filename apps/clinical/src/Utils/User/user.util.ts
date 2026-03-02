import { IClinicalVersion } from 'Models/ClinicalVersion/ClinicalVersion.model';

/**
 * Returns true if:
 * 1. User is the assigned clinician, curator or geneticist
 * 2. User is an assigned reviewer
 */
export function isUserAssigned(
  userId: string,
  clinicalVersion: IClinicalVersion,
): boolean {
  return (
    clinicalVersion.clinicianId === userId
    || clinicalVersion.curatorId === userId
    || clinicalVersion.cancerGeneticistId === userId
    || clinicalVersion.reviewerIds.map((r) => r.reviewerId).includes(userId)
  );
}
