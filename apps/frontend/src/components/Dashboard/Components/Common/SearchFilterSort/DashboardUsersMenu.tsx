import { nullUser } from '@/constants/User/user.constant';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { useUser } from '../../../../../contexts/UserContext';
import { IUserWithMetadata } from '../../../../../types/Auth/User.types';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import Search from '../../../../Search/Search';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    width: '100%',
  },
  menuItem: {
    width: '250px',
    height: '48px',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPopover-paper': {
      maxWidth: '100%',
    },
  },
  checkboxChecked: {
    color: '#1E86FC !important',
  },
  checkboxUnchecked: {
    color: '#273957 !important',
  },
}));

interface IUsersMenuProps<T> {
  anchorElUsers: null | HTMLElement;
  setAnchorElUsers: Dispatch<SetStateAction<HTMLElement | null>>;
  toggled: T;
  setToggled: Dispatch<SetStateAction<T>>;
  loading: boolean;
  closeParent?: () => void;
  type?: 'Curation' | 'Clinical';
}

export default function DashboardUsersMenu<T>({
  anchorElUsers,
  setAnchorElUsers,
  toggled,
  setToggled,
  loading,
  closeParent,
  type = 'Curation',
}: IUsersMenuProps<T>): JSX.Element {
  const classes = useStyles();
  const { users: allUsers } = useUser();

  const [users, setUsers] = useState<IUserWithMetadata[]>([]);
  const toggledKey = type === 'Curation' ? 'curators' : 'assignees';

  useEffect(() => {
    if (allUsers.length && !users.length) {
      setUsers([...allUsers, nullUser]);
    }
  }, [allUsers, users]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setToggled({
        ...toggled,
        [toggledKey]: [...toggled[toggledKey], event.target.value],
      });
    } else {
      setToggled({
        ...toggled,
        [toggledKey]: toggled[toggledKey].filter(
          (item) => item !== event.target.value,
        ),
      });
    }
  };

  const handleClose = (event, reason): void => {
    setAnchorElUsers(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const userOptions = users.map((user: IUserWithMetadata) => (
    <MenuItem className={classes.menuItem} key={user.id} disabled={loading}>
      <FormControlLabel
        value={`${user.givenName} ${user.familyName}::${user.id}`}
        control={(
          <Checkbox
            classes={{ root: toggled[toggledKey].find((u) => u.split('::')[1] === user.id) ? classes.checkboxChecked : classes.checkboxUnchecked }}
            checked={!!toggled[toggledKey].find((u) => u.split('::')[1] === user.id)}
            onChange={handleSelect}
          />
          )}
        label={`${user.givenName} ${user.familyName}`}
        labelPlacement="end"
      />
    </MenuItem>
  ));

  const selectedUserOptions = toggled[toggledKey].map((user: string) => {
    const userId = user.split('::')[1];
    const userObj = allUsers.find((u) => u.id === userId) ?? nullUser;
    return (
      <MenuItem className={classes.menuItem} key={user} disabled={loading}>
        <FormControlLabel
          value={`${userObj?.givenName} ${userObj?.familyName}::${userObj?.id}`}
          control={(
            <Checkbox
              classes={{ root: toggled[toggledKey].find((u) => u.split('::')[1] === userObj?.id) ? classes.checkboxChecked : classes.checkboxUnchecked }}
              checked={!!toggled[toggledKey].find((u) => u.split('::')[1] === userObj?.id)}
              onChange={handleSelect}
            />
          )}
          label={`${userObj?.givenName} ${userObj?.familyName}`}
          labelPlacement="end"
        />
      </MenuItem>
    );
  });

  const filterUserOptions = (query: string): void => {
    const newUserOptions = allUsers.filter((d) => d.familyName.toLowerCase().includes(query)
      || d.givenName.toLowerCase().includes(query));
    setUsers(newUserOptions);
  };

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorElUsers}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorElUsers)}
      onClose={handleClose}
      disableRestoreFocus
      PaperProps={{
        style: {
          width: 250,
        },
      }}
    >
      <Search searchMethod={filterUserOptions} searchOnChange />
      <Divider />
      <ScrollableSection style={{ maxHeight: '500px' }}>
        <ScrollableSection style={{ maxHeight: '200px' }}>
          {selectedUserOptions}
        </ScrollableSection>
        <Divider />
        {userOptions}
      </ScrollableSection>
    </Menu>
  );
}
