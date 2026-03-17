import { IUserWithMetadata } from '@/types/Auth/User.types';

export const nullUser: IUserWithMetadata = {
  id: 'null',
  givenName: 'Unassigned',
  familyName: '',
  azureId: '',
  email: '',
  avatar: '',
  groups: [],
  roles: [],
  sites: [],
  studies: [],
  scopes: [],
} as const;
