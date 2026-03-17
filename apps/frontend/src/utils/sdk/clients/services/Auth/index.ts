import { AxiosError, AxiosInstance } from 'axios';
import { Group } from '@/types/Auth/Group.types';
import { Role } from '@/types/Auth/Role.types';
import { Scope } from '@/types/Auth/Scope.types';
import { IUserWithMetadata } from '@/types/Auth/User.types';
import { ICommonResp, IScopeResp } from '@/types/Common.types';
import { groups } from './groups';
import { roles } from './roles';
import { users } from './users';
import { currentUser } from './currentUser';

export interface IAuthClient {
  getCurrentUser(): Promise<IUserWithMetadata | null | undefined>;
  getUserById(id: string): Promise<IUserWithMetadata | undefined>;
  getUsers(): Promise<IUserWithMetadata[]>;
  getRoles(): Promise<ICommonResp<Role>[]>;
  getScopesByRoleId(roleId: string): Promise<IScopeResp<Scope>[]>;
  getGroups(): Promise<ICommonResp<Group>[]>;
}

export function createAuthClient(instance: AxiosInstance): IAuthClient {
  async function getCurrentUser(): Promise<IUserWithMetadata | null | undefined> {
    try {
      const resp = currentUser;

      return resp;
    } catch (e) {
      if ((e as AxiosError).code !== 'ERR_CANCELED') return null;
      return undefined;
    }
  }

  async function getUserById(id: string): Promise<IUserWithMetadata | undefined> {
    const resp = users.find((u) => u.id === id);

    return resp;
  }

  async function getUsers(): Promise<IUserWithMetadata[]> {
    const resp = users;

    return resp;
  }

  async function getRoles(): Promise<ICommonResp<Role>[]> {
    const resp = roles;

    return resp;
  }

  async function getScopesByRoleId(roleId: string): Promise<IScopeResp<Scope>[]> {
    const resp = await instance.get(`/auth/roles/${roleId}/scopes`);

    return resp.data;
  }

  async function getGroups(): Promise<ICommonResp<Group>[]> {
    const resp = groups;

    return resp;
  }

  return {
    getCurrentUser,
    getUserById,
    getUsers,
    getRoles,
    getScopesByRoleId,
    getGroups,
  };
}
