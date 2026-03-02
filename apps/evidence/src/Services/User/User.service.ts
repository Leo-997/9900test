import { Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models/User/User.model';
import { currentUser } from './currentUser';

@Injectable()
export class UserService {
  constructor() {}

  public async getCurrentUser(): Promise<IUserWithMetadata | null> {
    return currentUser;
  }
}
