import React, { useEffect, useState, type JSX } from 'react';

import {
  Avatar,
  AvatarFallback,
} from '@/components/plate-ui/avatar';
import { IUser } from '@/types/Auth/User.types';
import { useUser } from '@/contexts/UserContext';
import { getInitials } from '@/utils/misc/strings';
import { getAvatarStyles } from '@/utils/functions/getAvatarStyles';

interface IProps {
  userId?: string;
}

export function CommentAvatar({
  userId,
}: IProps): JSX.Element {
  const { users } = useUser();

  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    setUser(users.find((u) => u.id === userId));
  }, [userId, users]);

  if (!user) return <div />;

  return (
    <Avatar className="size-7">
      <AvatarFallback
        style={{
          ...getAvatarStyles(user),
        }}
      >
        {getInitials(`${user.givenName} ${user.familyName}`)}
      </AvatarFallback>
    </Avatar>
  );
}
