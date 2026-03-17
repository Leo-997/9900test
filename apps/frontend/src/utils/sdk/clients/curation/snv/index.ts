import { AxiosInstance } from 'axios';
import { createGermlineSnvClient, IGermlineSnvClient } from './germline';
import { createSomaticSnvClient, ISomaticSnvClient } from './somatic';

export interface ISnvClients {
  germline: IGermlineSnvClient
  somatic: ISomaticSnvClient
}

export function createSnvClients(instance: AxiosInstance): ISnvClients {
  return {
    germline: createGermlineSnvClient(instance),
    somatic: createSomaticSnvClient(instance),
  };
}
