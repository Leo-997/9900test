import { BadRequestException, Injectable } from '@nestjs/common';
import { IAnalysisSet } from 'Models/Analysis/AnalysisSets.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AnalysisSetsService } from 'Services/Analysis/AnalysisSets.service';
import { UsersService } from 'Services/Users/Users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly analysisSetsService: AnalysisSetsService,
  ) {}

  async findUser(token: string): Promise<IUserWithMetadata | null> {
    const user = await this.usersService.getCurrentUser(token);

    return user;
  }

  async checkAssignedUserByAnalysis(
    query: { analysisSetId?: string, biosampleId?: string },
    user: IUserWithMetadata,
  ): Promise<boolean> {
    if (Object.values(query).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }

    const setsToCheck: IAnalysisSet[] = [];
    if (query.analysisSetId) {
      const set = await this.analysisSetsService.getAnalysisSetById(
        query.analysisSetId,
        user,
      );
      if (set) {
        setsToCheck.push(set);
      }
    }

    if (query.biosampleId) {
      setsToCheck.push(...await this.analysisSetsService.getAnalysisSets(
        {
          search: [query.biosampleId],
        },
        user,
      ));
    }

    // return setsToCheck.some((set) => isUserAssigned(user.id, set))
    //   || user.roles.map((r) => r.name).includes('ZeroDash Admin');
    return true;
  }

  async checkAssignedUserByPatientId(
    patientId: string,
    user: IUserWithMetadata,
  ): Promise<boolean> {
    await this.analysisSetsService.getAnalysisSets({ patientId }, user);

    // return (
    //   sets.some((set) => isUserAssigned(user.id, set))
    //   || user.roles.map((r) => r.name).includes('ZeroDash Admin')
    // );
    return true;
  }
}
