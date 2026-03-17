import { Request } from 'express';
import { IUserWithMetadata } from 'Models/User/User.model';

export interface IAuthenticatedRequest extends Request {
  user: IUserWithMetadata;
}
