import { IUserWithMetadata } from './Auth/User.types';

export type Avatar = {
  key: string;
  user?: IUserWithMetadata;
  title?: string;
  status?: 'ready' | 'progress' | 'done';
}

export type AvatarStatus = 'ready' | 'progress' | 'done';

export type SizeVariant = 'small' | 'medium' | 'large';
