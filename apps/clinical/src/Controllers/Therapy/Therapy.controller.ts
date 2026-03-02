import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { IUserWithMetadata } from 'Models';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import {
  MatchingTherapiesQueryDTO,
} from '../../Models/Therapy/Therapy.model';
import { TherapyService } from '../../Services/Therapy/Therapy.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
@Controller('/therapy')
export class TherapyController {
  constructor(
    @Inject(TherapyService) private therapyService: TherapyService,
  ) {}

  @Get('/matching-therapies')
  public async getMatchingTherapies(
    @Query() query: MatchingTherapiesQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.therapyService.getMatchingTherapies(query, user);
  }
}
