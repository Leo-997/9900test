import { Request } from 'express';
import { IUserWithMetadata } from 'Models/Users/Users.model';

export interface IAuthenticatedRequest extends Request {
  user: IUserWithMetadata;
}
