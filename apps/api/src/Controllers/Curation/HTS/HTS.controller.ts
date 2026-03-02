import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  HTSResultSummary,
  IHTSCulture,
  IHTSDrugCombination,
  IHTSResult,
} from 'Models/Curation/HTS/HTS.model';
import { GetHTSCombinationsQueryDTO, GetHTSResultQueryDTO } from 'Models/Curation/HTS/Requests/PaginatedHtsResults';
import {
  UpdateHTSResultByIdBodyDTO,
} from 'Models/Curation/HTS/Requests/UpdateHTSResultByIdBody.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { CreateHTSCombinationDTO } from 'Models/Curation/HTS/Requests/CreateHTSCombination.model';
import { UpdateHTSCombinationDTO } from 'Models/Curation/HTS/Requests/UpdateHTSCombination.model';
import { UpdateHTSCultureDTO } from 'Models/Curation/HTS/Requests/UpdateHTSCultureBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { HTSService } from 'Services/Curation/HTS/HTS.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('curation/:biosampleId/hts')
export class HTSController {
  constructor(
    private readonly htsService: HTSService,
    private readonly authService: AuthService,
  ) {}

  @Get('culture')
  @Scopes('curation.sample.read')
  async getHTSCulture(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IHTSCulture[]> {
    return this.htsService.getHTSCulture(biosampleId, user);
  }

  @Post('/results')
  @Scopes('curation.sample.read')
  async getHTSResult(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: GetHTSResultQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IHTSResult[]> {
    return this.htsService.getHTSResult(biosampleId, filters, user, page, limit);
  }

  @Post('/results/count')
  @Scopes('curation.sample.read')
  async getHTSResultCount(
    @Param('biosampleId') biosampleId: string,
    @Body() filters: GetHTSResultQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.htsService.getHTSResultCount(biosampleId, filters, user);
  }

  @Get('/summary')
  @Scopes('curation.sample.read')
  async getZScoreSummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<HTSResultSummary> {
    return this.htsService.getZScoreSummary(biosampleId, user);
  }

  @Get('/results/:screenId')
  @Scopes('curation.sample.read')
  async getHTSResultById(
    @Param('biosampleId') biosampleId: string,
    @Param('screenId') screenId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IHTSResult> {
    return this.htsService.getHTSResultById(biosampleId, screenId, user);
  }

  @Put('results/:screenId')
  @IsWriteEndpoint()
  async updateHtsResultById(
    @Param('biosampleId') biosampleId: string,
    @Param('screenId') screenId: string,
    @Body() body: UpdateHTSResultByIdBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAssigned = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAssigned && !user.scopes.map((s) => s.name).includes('curation.sample.hts.write')) {
      throw new ForbiddenException();
    }

    return this.htsService.updateHtsResultById(
      body,
      screenId,
      biosampleId,
    );
  }

  @Post('combinations')
  @Scopes('curation.sample.read')
  public async getDrugCombinations(
    @Param('biosampleId') biosampleId: string,
    @Body() query: GetHTSCombinationsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.htsService.getDrugCombinations(biosampleId, query, user);
  }

  @Get('combinations/:combinationId')
  @Scopes('curation.sample.read')
  public async getDrugCombinationsById(
    @Param('biosampleId') biosampleId: string,
    @Param('combinationId') combinationId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.htsService.getDrugCombinationsById(biosampleId, combinationId, user);
  }

  @Patch('culture/:screenName')
  @IsWriteEndpoint()
  public async updateHTSCulture(
    @Param('screenName') screenName: string,
    @Param('biosampleId') biosampleId: string,
    @Body() body: UpdateHTSCultureDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAssigned = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAssigned && !user.scopes.map((s) => s.name).includes('curation.sample.hts.write')) {
      throw new ForbiddenException();
    }

    return this.htsService.updateHTSCulture(
      biosampleId,
      screenName,
      body,
    );
  }

  @Post('combinations/new')
  @IsWriteEndpoint()
  public async createDrugCombination(
    @Param('biosampleId') biosampleId: string,
    @Body() body: CreateHTSCombinationDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const isAssigned = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAssigned && !user.scopes.map((s) => s.name).includes('curation.sample.hts.write')) {
      throw new ForbiddenException();
    }

    return this.htsService.createDrugCombination(biosampleId, body);
  }

  @Patch('combinations/:id')
  @IsWriteEndpoint()
  public async updateDrugCombination(
    @Param('biosampleId') biosampleId: string,
    @Param('id') id: string,
    @Body() body: UpdateHTSCombinationDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAssigned = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAssigned && !user.scopes.map((s) => s.name).includes('curation.sample.hts.write')) {
      throw new ForbiddenException();
    }

    return this.htsService.updateDrugCombination(id, body);
  }
}
