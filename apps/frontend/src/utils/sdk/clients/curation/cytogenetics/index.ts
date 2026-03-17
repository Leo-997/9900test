import { AxiosInstance } from 'axios';
import { createGermlineCytogeneticsClient, IGermlineCytogeneticsClient } from './germline';
import { createSomaticCytogeneticsClient, ISomaticCytogeneticsClient } from './somatic';

export interface ICytogeneticsClients {
  germline: IGermlineCytogeneticsClient
  somatic: ISomaticCytogeneticsClient
}

export function createCytogeneticsClients(instance: AxiosInstance): ICytogeneticsClients {
  return {
    germline: createGermlineCytogeneticsClient(instance),
    somatic: createSomaticCytogeneticsClient(instance),
  };
}
