import { AxiosInstance } from 'axios';
import { createAnalysisSetsClient, IAnalysisSetsClient } from './analysis/analysisSets';
import { createBiosamplesClient, IBiosamplesClient } from './biosamples/biosamples';
import { createFlagsClient, ICorrectionFlagsClient } from './flags';
import { createMetricsClient, IMetricsClient } from './precuration/metrics';
import { createPurityClient, IPurityClient } from './precuration/purity';
import { createPrecurationValidationClient, IPrecurationValidationClient } from './precuration/validation';
import { createMolecularConfirmationClient, IMolecularConfirmationClient } from './molecularConfirmation';
import { createCurationAtlasClient, ICurationAtlasClient } from './atlas';

export interface ICurationSDK {
  analysisSets: IAnalysisSetsClient;
  biosamples: IBiosamplesClient;
  purity: IPurityClient;
  metrics: IMetricsClient;
  flags: ICorrectionFlagsClient;
  validation: IPrecurationValidationClient
  molecularConfirmation: IMolecularConfirmationClient
  atlas: ICurationAtlasClient;
}

export function createCurationSDK(instance: AxiosInstance): ICurationSDK {
  return {
    analysisSets: createAnalysisSetsClient(instance),
    biosamples: createBiosamplesClient(instance),
    purity: createPurityClient(instance),
    metrics: createMetricsClient(instance),
    flags: createFlagsClient(instance),
    validation: createPrecurationValidationClient(instance),
    molecularConfirmation: createMolecularConfirmationClient(instance),
    atlas: createCurationAtlasClient(instance),
  };
}
