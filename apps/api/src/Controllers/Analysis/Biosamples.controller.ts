import {
  Controller, Get, Inject, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  BiosamplesFiltersDTO, IBiosample, IPipeline, PipelineFiltersDTO,
} from 'Models/Analysis/Biosamples.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { BiosamplesService } from 'Services/Analysis/Biosamples.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('biosamples')
export class BiosamplesController {
  constructor(
    @Inject(BiosamplesService) private readonly biosamplesService: BiosamplesService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  public async getBiosamples(
    @Query() filters: BiosamplesFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IBiosample[]> {
    return this.biosamplesService.getBiosamples(filters, user);
  }

  @Get('count')
  @Scopes('curation.sample.read')
  public async getBiosampleCount(
    @Query() filters: BiosamplesFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.biosamplesService.getBiosampleCount(filters, user);
  }

  @Get('pipelines')
  @Scopes('curation.sample.read')
  public async getPipelines(
    @Query() filters: PipelineFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPipeline[]> {
    return this.biosamplesService.getPipelines(filters, user);
  }

  @Get(':biosampleId')
  @Scopes('curation.sample.read')
  public async getBiosampleById(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IBiosample> {
    return this.biosamplesService.getBiosampleById(biosampleId, user);
  }
}
