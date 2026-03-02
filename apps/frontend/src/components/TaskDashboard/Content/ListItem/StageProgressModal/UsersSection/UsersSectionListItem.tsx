import CustomChip from '@/components/Common/Chip';
import CustomTypography from '@/components/Common/Typography';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import UsersMenu from '@/components/UsersMenu/UsersMenu';
import { corePalette } from '@/themes/colours';
import { Group } from '@/types/Auth/Group.types';
import { IUser } from '@/types/Auth/User.types';
import { Avatar } from '@/types/Avatar.types';
import { Box, IconButton, Stack } from '@mui/material';
import { useState, type JSX } from 'react';

interface IProp {
  group: Group | null;
  onUpdate: (user: IUser | null) => void;
  disabled?: boolean;
  assignedUser?: Avatar;
}

export default function UsersSectionListItem({
  group,
  onUpdate,
  disabled = false,
  assignedUser,
}: IProp): JSX.Element {
  const [usersMenuAnchor, setUsersMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Stack
      key={assignedUser?.key}
      display="flex"
      flexDirection="row"
      alignItems="center"
      padding="8px"
      gap="50px"
      sx={{
        opacity: disabled ? '60%' : undefined,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap="15px"
        width={assignedUser ? '200px' : undefined}
      >
        <IconButton
          onClick={(e): void => setUsersMenuAnchor(e.currentTarget)}
          disabled={disabled}
        >
          <AvatarWithBadge
            borderStyle={assignedUser?.user ? 'solid' : 'dashed'}
            user={assignedUser?.user || null}
            status={assignedUser?.status}
          />
        </IconButton>
        <CustomTypography variant="bodyRegular">
          {assignedUser?.user ? (
            `${assignedUser.user?.givenName} ${assignedUser.user?.familyName}`
          ) : 'Unassigned'}
        </CustomTypography>
      </Box>
      <CustomChip
        label={assignedUser?.title}
        backgroundColour={corePalette.grey30}
        sx={{
          width: 'fit-content',
        }}
      />
      {group && (
        <UsersMenu
          anchorEl={usersMenuAnchor}
          onClose={(): void => setUsersMenuAnchor(null)}
          group={group}
          handleUserSelect={(user): void => {
            onUpdate(user);
            setUsersMenuAnchor(null);
          }}
          selectedUserId={assignedUser?.user?.id || null}
        />
      )}
    </Stack>
  );
}
