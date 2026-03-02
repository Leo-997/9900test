import { AxiosInstance } from 'axios';
import { createGermlineCnvClient, IGermlineCnvClient } from './germline';
import { createSomaticCnvClient, ISomaticCnvClient } from './somatic';

export interface ICnvClients {
  germline: IGermlineCnvClient
  somatic: ISomaticCnvClient
}

export function createCnvClients(instance: AxiosInstance): ICnvClients {
  return {
    germline: createGermlineCnvClient(instance),
    somatic: createSomaticCnvClient(instance),
  };
}
