import {
  Avatar,
  Badge,
  SxProps,
  Theme,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';

import { makeStyles } from '@mui/styles';
import {
  CircleCheckIcon, ClockIcon, PlayCircleIcon, PlusIcon,
} from 'lucide-react';
import { corePalette } from '@/themes/colours';
import { IUser } from '@/types/Auth/User.types';
import { AvatarStatus, SizeVariant } from '@/types/Avatar.types';
import { getAvatarStyles } from '@/utils/functions/getAvatarStyles';
import CustomTypography from '../Common/Typography';

import { getInitials } from '../../utils/misc/strings';
import CircleIcon from './CircleIcon';

const useStyles = makeStyles(() => ({
  small: {
    width: 24,
    height: 24,
  },
  medium: {
    width: 36,
    height: 36,
  },
  large: {
    width: 40,
    height: 40,
  },
  huge: {
    width: 80,
    height: 80,
  },
  smallText: {
    fontSize: '10px !important',
  },
  mediumText: {
    fontSize: '16px',
  },
  largeText: {
    fontSize: '20px',
  },
  hugeText: {
    fontSize: '34px',
  },
  badgeAnchor: {
    right: '5px',
    bottom: '5px',
    transform: 'scale(1) translate(50%, 50%)',
    transformOrigin: '100% 100%',
  },
}));

interface IProps {
  user?: IUser | null;
  size?: SizeVariant;
  avatarContent?: JSX.Element;
  badgeText?: string;
  borderStyle?: 'dashed' | 'solid';
  status?: AvatarStatus;
  iconColour?: string;
  defaultBackgroundColour?: string;
  overrideClass?: string;
  sx?: SxProps<Theme>;
}

export function AvatarWithBadge({
  user,
  size = 'medium',
  avatarContent,
  badgeText = '',
  status,
  borderStyle = 'solid',
  iconColour = '#022034',
  defaultBackgroundColour = '#FFFFFF',
  overrideClass,
  sx,
}: IProps): JSX.Element {
  const classes = useStyles();

  const sizeDictionary = {
    small: {
      avatarSize: 24,
      badgeSize: 12,
      badgeTextSize: 30,
    },
    medium: {
      avatarSize: 44,
      badgeSize: 18,
      badgeTextSize: 24,
    },
    large: {
      avatarSize: 64,
      badgeSize: 25,
      badgeTextSize: 24,
    },
  };

  const getAvatarContent = (): JSX.Element => {
    if (avatarContent) return avatarContent;

    if (!user) {
      return (
        <PlusIcon color={iconColour} />
      );
    }

    return (
      <CustomTypography
        variant="bodySmall"
        fontWeight="medium"
        className={classes[`${size}Text`]}
      >
        {getInitials(`${user.givenName} ${user.familyName}`)}
      </CustomTypography>
    );
  };

  const circleIconSize = ((): string => {
    if (size === 'small') return '0.7em';

    return '0.8em';
  })();

  const getBadgeContent = (): ReactNode => {
    if (status) {
      if (status === 'ready') {
        return (
          <PlayCircleIcon
            size={sizeDictionary[size].badgeSize}
            color={corePalette.offBlack100}
          />
        );
      }
      if (status === 'progress') {
        return (
          <ClockIcon
            size={sizeDictionary[size].badgeSize}
            fill={corePalette.orange100}
            stroke={corePalette.white}
          />
        );
      }
      if (status === 'done') {
        return (
          <CircleCheckIcon
            size={sizeDictionary[size].badgeSize}
            fill={corePalette.green150}
            stroke={corePalette.white}
          />
        );
      }
    }
    if (badgeText !== '') {
      return (
        <CircleIcon
          width={circleIconSize}
          height={circleIconSize}
          iconColor={corePalette.grey200}
          text={badgeText}
          textColor={corePalette.white}
          textSize={sizeDictionary[size].badgeTextSize}
        />
      );
    }

    return null;
  };

  return (
    <Badge
      className={overrideClass}
      sx={sx}
      classes={{
        anchorOriginBottomRightRectangular: classes.badgeAnchor,
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={getBadgeContent()}
    >
      <Avatar
        sizes=""
        src={user && user.avatar?.includes('url') ? user.avatar.split(';')[1] : undefined}
        sx={{
          width: sizeDictionary[size].avatarSize,
          height: sizeDictionary[size].avatarSize,
        }}
        style={getAvatarStyles(user, borderStyle, defaultBackgroundColour)}
      >
        {getAvatarContent()}
      </Avatar>
    </Badge>
  );
}
