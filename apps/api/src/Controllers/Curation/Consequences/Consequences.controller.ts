import {
  Controller, Get, Inject, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetConsequencesQueryDTO, IImpactGroups } from 'Models/Curation/Consequences/Consequences.model';
import { ConsequencesService } from 'Services/Curation/Consequences/Consequences.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('consequences')
export class ConsequencesController {
  constructor(
    @Inject(ConsequencesService) private readonly consequencesService: ConsequencesService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  public async getConequences(
    @Query() filters: GetConsequencesQueryDTO,
  ): Promise<IImpactGroups | string[]> {
    return this.consequencesService.getConsequences(filters);
  }
}
