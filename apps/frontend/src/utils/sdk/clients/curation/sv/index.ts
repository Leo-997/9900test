import { AxiosInstance } from 'axios';
import { IGermlineSvClient, createGermlineSvClient } from './germline';
import { ISomaticSvClient, createSomaticSvClient } from './somatic';

export interface ISvClients {
  germline: IGermlineSvClient,
  somatic: ISomaticSvClient,
}

export function createSvClients(instance: AxiosInstance): ISvClients {
  return {
    germline: createGermlineSvClient(instance),
    somatic: createSomaticSvClient(instance),
  };
}
