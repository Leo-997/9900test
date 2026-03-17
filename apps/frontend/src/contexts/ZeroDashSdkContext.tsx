import axios, { InternalAxiosRequestConfig } from 'axios';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  type JSX,
} from 'react';
import { LoadingPage } from '@/pages/Loading/Loading';
import { createCurationSDK, ICurationSDK } from '@/utils/sdk/clients/curation';
import { createSvClients, ISvClients } from '@/utils/sdk/clients/curation/sv';

import { createCurationTherapiesClient, ICurationTherapiesClient } from '@/utils/sdk/clients/curation/therapies';
import { createCytogeneticsClients, ICytogeneticsClients } from '@/utils/sdk/clients/curation/cytogenetics';
import {
  createCnvClients,
  ICnvClients,
} from '../utils/sdk/clients/curation/cnv';
import {
  createGeneClient,
  IGeneClient,
} from '../utils/sdk/clients/curation/gene';
import {
  createMethylationClient,
  IMethylationClient,
} from '../utils/sdk/clients/curation/methylation';
import {
  createMutationalSignaturesClient,
  IMutationalSignaturesClient,
} from '../utils/sdk/clients/curation/mutsig';
import {
  createPathwaysClient,
  IPathwaysClient,
} from '../utils/sdk/clients/curation/pathways';
import { createRnaClient, IRnaClient } from '../utils/sdk/clients/curation/rna';
import {
  createSnvClients,
  ISnvClients,
} from '../utils/sdk/clients/curation/snv';
import {
  createPatientClient,
  IPatientClient,
} from '../utils/sdk/clients/patient';

import { createCurationCommentsClient, ICurationCommentsClient } from '../utils/sdk/clients/curation/comments';
import { createConsequencesClient, IConsequencesClient } from '../utils/sdk/clients/curation/consequences';
import {
  createEvidencesClient,
  ICurationEvidencesClient,
} from '../utils/sdk/clients/curation/evidences';
import { createHtsClient, IHTSClient } from '../utils/sdk/clients/curation/hts';
import { createReportableVariantsClient, IReportableVariantsClient } from '../utils/sdk/clients/curation/reportableVariants';
import { createFileTrackerClient, IFileTrackerClient } from '../utils/sdk/clients/fileTracker/fileTracker';
import { createIGVClient, IIGVClient } from '../utils/sdk/clients/igv';
import {
  createMeetingClient,
  IMeetingClient,
} from '../utils/sdk/clients/meetings';
import { createPlotsClient, IPlotsClient } from '../utils/sdk/clients/plots';
import { createServicesSdk, IServicesSdk } from '../utils/sdk/clients/services';
import { createMTBSdk, IMTBSdk } from '../utils/sdk/mtb';

export interface IZeroDashSdk {
  sv: ISvClients;
  rna: IRnaClient;
  cnv: ICnvClients;
  snv: ISnvClients;
  hts: IHTSClient;
  gene: IGeneClient;
  plots: IPlotsClient;
  patient: IPatientClient;
  pathways: IPathwaysClient;
  methylation: IMethylationClient;
  cytogenetics: ICytogeneticsClients;
  mutsig: IMutationalSignaturesClient;
  curationEvidence: ICurationEvidencesClient;
  curationTherapies: ICurationTherapiesClient;
  curationComments: ICurationCommentsClient;
  meetings: IMeetingClient;
  filetracker: IFileTrackerClient;
  igv: IIGVClient;
  consequences: IConsequencesClient;
  services: IServicesSdk;
  mtb: IMTBSdk;
  curation: ICurationSDK;
  reportableVariants: IReportableVariantsClient;
}

interface IProps {
  children: ReactNode;
}

export const ZeroDashSdkContext = createContext<IZeroDashSdk | undefined>(undefined);
export const useZeroDashSdk = (): IZeroDashSdk => {
  const context = useContext(ZeroDashSdkContext);

  if (!context) throw new Error('ZeroDashSdk context is not available at this scope');

  return context || {} as IZeroDashSdk;
};

export function ZeroDashSdkProvider({ children }: IProps): JSX.Element {
  const [zeroDashSdk, setZeroDashSdk] = useState<IZeroDashSdk>();

  const createInterceptors = useCallback((req: InternalAxiosRequestConfig) => {
    // Magic to ensure calls to wait for auth first
    try {
      const newReq = { ...req, headers: req.headers ?? {} };
      newReq.headers.Authorization = 'Bearer fake-token';

      return newReq;
    } catch {
    }
    // token is not ready, cancel the request
    return {
      ...req,
      signal: AbortSignal.timeout(0),
    };
  }, []);

  useEffect(() => {
    function initZeroDashSdk(): IZeroDashSdk {
      const instance = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
      });
      const authInstance = axios.create({
        baseURL: import.meta.env.VITE_AUTH_URL,
      });
      const notificationsInstance = axios.create({
        baseURL: import.meta.env.VITE_NOTIFICATIONS_URL,
      });

      instance.interceptors.request.use(createInterceptors);
      authInstance.interceptors.request.use(createInterceptors);
      notificationsInstance.interceptors.request.use(createInterceptors);

      return {
        sv: createSvClients(instance),
        rna: createRnaClient(instance),
        cnv: createCnvClients(instance),
        snv: createSnvClients(instance),
        hts: createHtsClient(instance),
        gene: createGeneClient(instance),
        plots: createPlotsClient(instance),
        patient: createPatientClient(instance),
        pathways: createPathwaysClient(instance),
        methylation: createMethylationClient(instance),
        cytogenetics: createCytogeneticsClients(instance),
        mutsig: createMutationalSignaturesClient(instance),
        curationEvidence: createEvidencesClient(instance),
        curationTherapies: createCurationTherapiesClient(instance),
        curationComments: createCurationCommentsClient(instance),
        meetings: createMeetingClient(instance),
        filetracker: createFileTrackerClient(instance),
        igv: createIGVClient(instance),
        consequences: createConsequencesClient(instance),
        services: createServicesSdk(instance, authInstance, notificationsInstance),
        mtb: createMTBSdk(instance),
        curation: createCurationSDK(instance),
        reportableVariants: createReportableVariantsClient(instance),
      };
    }

    setZeroDashSdk(initZeroDashSdk());
  }, [createInterceptors]);

  return zeroDashSdk ? (
    <ZeroDashSdkContext.Provider value={zeroDashSdk}>
      {children}
    </ZeroDashSdkContext.Provider>
  ) : (
    <LoadingPage />
  );
}
