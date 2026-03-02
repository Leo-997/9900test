import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { Group } from '@/types/Auth/Group.types';
import { Role } from '@/types/Auth/Role.types';
import { Scope } from '@/types/Auth/Scope.types';
import { IUserWithMetadata } from '@/types/Auth/User.types';
import { ICommonResp, IScopeResp } from '@/types/Common.types';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  children: ReactNode;
}

interface IUserContext {
  currentUser?: IUserWithMetadata | null;
  loading: boolean;
  error?: string;
  users: IUserWithMetadata[];
  groups: ICommonResp<Group>[];
  roles: ICommonResp<Role>[];
  assignedCuratorScopes: IScopeResp<Scope>[];
  assignedClinicianScopes: IScopeResp<Scope>[];
  getGroupById: (groupId: string) => Group | null;
}

export const UserContext = createContext<IUserContext>({
  loading: true,
  users: [],
  groups: [],
  roles: [],
  assignedCuratorScopes: [],
  assignedClinicianScopes: [],
  getGroupById: () => null,
});

UserContext.displayName = 'UserContext';

export const useUser = (): IUserContext => useContext(UserContext);

export function UserProvider({ children }: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [currentUser, setCurrentUser] = useState<IUserWithMetadata | null>();
  const [users, setUsers] = useState<IUserWithMetadata[]>([]);
  const [roles, setRoles] = useState<ICommonResp<Role>[]>([]);
  const [groups, setGroups] = useState<ICommonResp<Group>[]>([]);
  const [assignedCuratorScopes, setAssignedCuratorScopes] = useState<IScopeResp<Scope>[]>([]);
  const [assignedClinicianScopes, setAssignedClinicianScopes] = useState<IScopeResp<Scope>[]>([]);

  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getCurrentUser(): Promise<void> {
      const currUser = await zeroDashSdk.services.auth.getCurrentUser();
      setCurrentUser(currUser);
    }

    async function getAllUsers(): Promise<void> {
      const usersResp = await zeroDashSdk.services.auth.getUsers();
      usersResp.sort((a, b) => a.givenName.localeCompare(b.givenName));
      setUsers(usersResp);
    }

    async function getAllGroups(): Promise<void> {
      const groupsResp = await zeroDashSdk.services.auth.getGroups();
      setGroups(groupsResp);
    }

    async function getAllRoles(): Promise<void> {
      const rolesResp = await zeroDashSdk.services.auth.getRoles();
      setRoles(rolesResp);

      const assignedCuratorId = rolesResp.find((r) => r.name === 'ZeroDash Assigned Curator');
      const curatorScopes = await zeroDashSdk.services.auth.getScopesByRoleId(assignedCuratorId?.id || '');
      setAssignedCuratorScopes(curatorScopes);

      const assignedClinicianId = rolesResp.find((r) => r.name === 'ZeroDash Assigned Clinician');
      const clinicianScopes = await zeroDashSdk.services.auth.getScopesByRoleId(assignedClinicianId?.id || '');
      setAssignedClinicianScopes(clinicianScopes);
    }

    setLoading(true);
    try {
      getCurrentUser();
      getAllUsers();
      getAllGroups();
      getAllRoles();
    } catch {
      setError('An error occurred while getting current user');
    } finally {
      setLoading(false);
    }
  }, [zeroDashSdk.patient, zeroDashSdk.services.auth]);

  const getGroupById = useCallback((groupId: string): Group | null => (
    groups.find((group) => group.id === groupId)?.name || null
  ), [groups]);

  const value = useMemo<IUserContext>(() => ({
    currentUser,
    loading,
    error,
    users,
    groups,
    roles,
    assignedCuratorScopes,
    assignedClinicianScopes,
    getGroupById,
  }), [
    currentUser,
    loading,
    error,
    users,
    groups,
    roles,
    assignedCuratorScopes,
    assignedClinicianScopes,
    getGroupById,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
