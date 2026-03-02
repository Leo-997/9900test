import {
  Controller, Get, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PathwaysCurationService } from 'Services/Curation/Pathways/Pathways.service';

import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetRnaPathwaysQueryDTO } from 'Models/Curation/Pathways/Requests/GetRnaPathwaysQuery.model';
import { IRnaPathway } from 'Models/Curation/Pathways/RnaPathways.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/pathways')
export class PathwaysCurationController {
  constructor(private readonly pathwaysService: PathwaysCurationService) {}

  @Get()
  @Scopes('curation.sample.read')
  async getRnaPathways(
    @Param('biosampleId') biosampleId: string,
    @Query() { page, limit, ...filters }: GetRnaPathwaysQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IRnaPathway[]> {
    return this.pathwaysService.getRnaPathways(biosampleId, filters, user, page, limit);
  }

  @Get('count')
  @Scopes('curation.sample.read')
  async getRnaPathwaysCount(
    @Param('biosampleId') biosampleId: string,
    @Query() filters: GetRnaPathwaysQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.pathwaysService.getRnaPathwaysCount(biosampleId, filters, user);
  }
}
