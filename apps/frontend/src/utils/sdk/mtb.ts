import { AxiosInstance } from 'axios';
import { createClinicalClient, IClinicalClient } from './clients/mtb/clinical';
import { createSlidesClient, ISlidesClient } from './clients/mtb/clinical/slides';
import { createMolAlterationClient, IMolecularAlterationClient } from './clients/mtb/clinical/molecularAlteration';
import { createRecommendationClient, IRecommendationClient } from './clients/mtb/recommendation';
import { createClinicalInfoClient, IClinicalInfoClient } from './clients/mtb/clinical/clinicalInfo';
import { createClinicalCommentsClient, IClinicalCommentsClient } from './clients/mtb/comments/comment';
import { createAddendumClient, IAddendumClient } from './clients/mtb/addendum';
import { createClinicalEvidenceClient, IClinicalEvidenceClient } from './clients/mtb/evidence';
import { createInterpretationsClient, IInterpretationsClient } from './clients/mtb/interpretations/interpretations';
import { createClinicalDrugsClient, IClinicalDrugsClient } from './clients/mtb/drugs';
import { createClinicalArchiveClient, IClinicalArchiveClient } from './clients/mtb/archive';
import { createTherapiesClient, ITherapiesClient } from './clients/mtb/therapies/therapies';

export interface IMTBSdk {
  archive: IClinicalArchiveClient;
  clinical: IClinicalClient;
  slides: ISlidesClient;
  molAlteration: IMolecularAlterationClient;
  recommendation: IRecommendationClient;
  clinicalInfo: IClinicalInfoClient;
  comment: IClinicalCommentsClient;
  interpretations: IInterpretationsClient;
  addendum: IAddendumClient;
  evidence: IClinicalEvidenceClient;
  drugs: IClinicalDrugsClient;
  therapies: ITherapiesClient;
}

export function createMTBSdk(
  instance: AxiosInstance,
): IMTBSdk {
  return {
    archive: createClinicalArchiveClient(instance),
    clinical: createClinicalClient(instance),
    slides: createSlidesClient(instance),
    molAlteration: createMolAlterationClient(instance),
    recommendation: createRecommendationClient(instance),
    clinicalInfo: createClinicalInfoClient(instance),
    comment: createClinicalCommentsClient(instance),
    interpretations: createInterpretationsClient(instance),
    addendum: createAddendumClient(instance),
    evidence: createClinicalEvidenceClient(instance),
    drugs: createClinicalDrugsClient(instance),
    therapies: createTherapiesClient(instance),
  };
}
