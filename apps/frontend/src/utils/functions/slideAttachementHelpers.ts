import { IMolAlterationSampleDetails, IMolecularAlterationDetail } from '../../types/MTB/MolecularAlteration.types';

export function getSlideAttachmentTitle(
  alteration: IMolecularAlterationDetail | IMolAlterationSampleDetails,
): string {
  if (alteration.mutationType === 'RNA_SEQ') {
    return alteration.gene;
  } if (alteration.mutationType === 'MUTATIONAL_SIG') {
    return ((alteration.additionalData?.signature || '') as string).replace('sig', 'Signature ') as string;
  }

  return 'File Title';
}

export function getSlideAttachmentCaption(
  alteration: IMolecularAlterationDetail | IMolAlterationSampleDetails,
): string {
  if (alteration.mutationType === 'RNA_SEQ') {
    return 'TPM Graph';
  } if (alteration.mutationType === 'MUTATIONAL_SIG') {
    return 'COSMIC Profile Matching';
  }

  return 'File';
}
