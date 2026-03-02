import { Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models';
import { isUserAssigned } from 'Utils/User/user.util';
import { SampleService } from '../Sample/Sample.service';
import { UserService } from '../User/User.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly sampleService: SampleService,
  ) {}

  async findUser(): Promise<IUserWithMetadata | null> {
    const user = await this.usersService.getCurrentUser();

    if (!user) {
      return null;
    }

    return user;
  }

  async checkAssignedUser(
    clinicalVersionId: string,
    user: IUserWithMetadata,
  ): Promise<boolean> {
    const clinicalVersion = await this.sampleService.getClinicalVersion(
      user,
      clinicalVersionId,
    );

    return (
      isUserAssigned(user.id, clinicalVersion)
      || user.roles.map((r) => r.name).includes('ZeroDash Admin')
    );
  }
}
