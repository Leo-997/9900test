import { Request } from 'express';
import { IUserWithMetadata } from '../User/User.model';

export interface IAuthenticatedRequest extends Request {
  user: IUserWithMetadata;
}
