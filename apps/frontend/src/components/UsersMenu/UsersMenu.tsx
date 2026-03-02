import { Menu, MenuItem } from '@mui/material';
import { ReactNode, useEffect, useState, type JSX } from 'react';
import { Group } from '@/types/Auth/Group.types';
import { IUser, IUserWithMetadata } from '../../types/Auth/User.types';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import CustomTypography from '../Common/Typography';
import { useUser } from '../../contexts/UserContext';

interface IUsersMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  handleUserSelect: (user: IUser | null) => void;
  selectedUserId?: string | null;
  group?: Group;
  includeNone?: boolean;
  customFilterFn?: (user: IUser) => boolean;
  additionalItems?: ReactNode;
}

export default function UsersMenu({
  anchorEl,
  onClose,
  handleUserSelect,
  selectedUserId,
  group,
  includeNone = true,
  customFilterFn = (): boolean => true,
  additionalItems,
}: IUsersMenuProps): JSX.Element {
  const { users: allUsers } = useUser();

  const [users, setUsers] = useState<IUserWithMetadata[]>(allUsers);

  useEffect(() => {
    if (group) {
      setUsers(allUsers
        .filter((u) => u.isActive)
        .filter((u) => u.groups.some((g) => g.name === group)));
    }
  }, [allUsers, group]);

  return (
    <Menu
      open={Boolean(anchorEl) && users !== undefined}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <ScrollableSection
        style={{
          height: '100%',
          maxHeight: '500px',
          minWidth: '250px',
        }}
      >
        {additionalItems}
        {includeNone && (
          <MenuItem
            key="none"
            onClick={(): void => handleUserSelect(null)}
            selected={selectedUserId === null}
          >
            <i>None</i>
          </MenuItem>
        )}
        {users?.filter((user) => customFilterFn(user)).map((user) => (
          <MenuItem
            key={user.id}
            onClick={(): void => handleUserSelect(user)}
            selected={selectedUserId === user.id}
          >
            <CustomTypography truncate>
              {user.givenName}
              {' '}
              {user.familyName}
            </CustomTypography>
          </MenuItem>
        ))}
      </ScrollableSection>
    </Menu>
  );
}
