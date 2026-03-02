import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Scope } from '../types/Auth/Scope.types';

export function useIsUserAuthorised(
  scope: Scope,
  isAssignedCurator?: boolean,
  isAssignedClinician?: boolean,
): boolean {
  const {
    currentUser,
    assignedCuratorScopes,
    assignedClinicianScopes,
  } = useUser();

  const [isAuthorised, setIsAuthorised] = useState<boolean>(false);

  useEffect(() => {
    const scopes: Scope[] = currentUser?.scopes.map((s) => s.name) || [];

    // Append scopes from pseudo-roles if needed
    if (isAssignedCurator) scopes.push(...assignedCuratorScopes.map((s) => s.name));
    if (isAssignedClinician) scopes.push(...assignedClinicianScopes.map((s) => s.name));

    setIsAuthorised(true);
  }, [
    scope,
    isAssignedCurator,
    isAssignedClinician,
    currentUser?.scopes,
    assignedCuratorScopes,
    assignedClinicianScopes,
  ]);

  return isAuthorised;
}
