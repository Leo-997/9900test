import {
  Body, Controller, ForbiddenException, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {
  ICohortStats,
  IMethCounts,
  IMethGeneTable,
  IMethylationData,
  IMethylationGeneData,
  IMethylationPredictionData,
} from 'Models/Curation/Methylation/Methylation.model';
import { UpdateMethDiagnosisBodyDTO, UpdateMethGeneBodyDTO, UpdateMethPredBodyDTO } from 'Models/Curation/Methylation/Requests/UpdateMethBody.model';
import { MethylationService } from 'Services/Curation/Methylation/Methylation.service';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetReportableVariantDTO } from 'Models/Common/Requests/GetReportableVariant.model';
import { CreateMethResultBodyDTO } from 'Models/Curation/Methylation/Requests/CreateMethResultBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/methylation')
export class MethylationController {
  constructor(
    private readonly methylationService: MethylationService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  async getMethData(
    @Param('biosampleId') biosampleId: string,
    @Query() filters: GetReportableVariantDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethylationData[]> {
    const data = await this.methylationService.getMethData(biosampleId, filters, user);
    return data;
  }

  @Get('prediction')
  @Scopes('curation.sample.read')
  async getMethPredData(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethylationPredictionData> {
    const data = await this.methylationService.getMethPredData(biosampleId, user);
    return data;
  }

  @Get('genes')
  @Scopes('curation.sample.read')
  async getMethGeneData(
    @Param('biosampleId') biosampleId: string,
    @Query() filters: GetReportableVariantDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethylationGeneData[]> {
    const data = await this.methylationService.getMethGeneData(biosampleId, filters, user);
    return data;
  }

  @Get('cohort')
  @Scopes('curation.sample.read')
  async getMethMGMTCohort(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICohortStats[]> {
    return this.methylationService.getMethMGMTCohort(biosampleId, user);
  }

  @Get('cohortCount')
  @Scopes('curation.sample.read')
  async countMethMGMT(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethCounts> {
    return this.methylationService.countMethMGMT(biosampleId, user);
  }

  @Get('genes/:gene')
  @Scopes('curation.sample.read')
  async getMethGeneTable(
    @Param('biosampleId') biosampleId: string,
    @Param('gene') gene: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMethGeneTable[]> {
    const data = await this.methylationService.getMethGeneTable(biosampleId, gene, user);
    return data;
  }

  @Put('update/:groupId')
  @IsWriteEndpoint()
  public async updateMeth(
    @Param('biosampleId') biosampleId: string,
    @Param('groupId') groupId: string,
    @Body() updatedMethBody: UpdateMethDiagnosisBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.methylationService.updateMeth(
      biosampleId,
      groupId,
      updatedMethBody,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find methylation sample to update');
  }

  @Put('gene/:geneId')
  @IsWriteEndpoint()
  public async updateMethGene(
    @Param('biosampleId') biosampleId: string,
    @Param('geneId') geneId: string,
    @Body() updatedMethBody: UpdateMethGeneBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();
    const numRowsUpdated = await this.methylationService.updateMethGene(
      biosampleId,
      geneId,
      updatedMethBody,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find methylation sample to update');
  }

  @Put('prediction')
  @IsWriteEndpoint()
  public async updateMethPred(
    @Param('biosampleId') biosampleId: string,
    @Body() updatedMethPredBody: UpdateMethPredBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.methylationService.updateMethPred(
      biosampleId,
      updatedMethPredBody,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find methylation sample to update');
  }

  @Post('result')
  @IsWriteEndpoint()
  public async createMethResult(
    @Param('biosampleId') biosampleId: string,
    @Body() createdMethResultBody: CreateMethResultBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsCreated = await this.methylationService.createMethResult(
      biosampleId,
      createdMethResultBody,
    );

    if (numRowsCreated) {
      return {
        message: `${numRowsCreated} records updated`,
      };
    }

    throw new NotFoundError('Could not find methylation sample to update');
  }
}
