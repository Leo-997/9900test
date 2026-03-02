import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RnaService } from 'Services/Curation/RNA/RNA.service';

import {
  ClassifierDTO,
  GetRNAByIdQueryDTO,
  PaginatedSampleSomaticRnaQueryDTO,
  UpdateRNAClassifierFiltersDTO,
} from 'Models/Curation/RNA/Requests/RnaSampleQuery.model';
import { UpdatePlotsBodyDTO, UpdateRnaSeqSampleBodyDTO } from 'Models/Curation/RNA/Requests/UpdateRnaSeqBody.model';
import {
  IRNASeqClassifierData,
  IRNASeqGeneTPMData,
  IRNATSNEData,
  ISomaticRna,
  IUpdateRNAClassifier,
} from 'Models/Curation/RNA/RnaSample.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetReportableVariantDTO } from 'Models/Common/Requests/GetReportableVariant.model';
import { Summary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { IncomingHttpHeaders } from 'http';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('curation/:biosampleId/rna')
export class RnaController {
  constructor(
    private readonly rnaService: RnaService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getRnaSamples(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: PaginatedSampleSomaticRnaQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticRna[]> {
    return this.rnaService.getSeqSampleRnas(biosampleId, filters, user, page, limit);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getRnaSamplesCount(
    @Param('biosampleId') biosampleId: string,
    @Body() { ...filters }: PaginatedSampleSomaticRnaQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.rnaService.getSeqSampleRnasCount(biosampleId, filters, user);
  }

  @Post('classifier')
  async getRNAClassifierData(
    @Param('biosampleId') biosampleId: string,
    @Body() filters: GetReportableVariantDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierData[]> {
    const data = await this.rnaService.getSeqSampleRNAClassifier(biosampleId, filters, user);
    return data;
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getRNASummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Summary> {
    return this.rnaService.getRNASummary(biosampleId, user);
  }

  @Get('tsne')
  @Scopes('curation.sample.read')
  async getRNATSNEData(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IRNATSNEData[]> {
    return this.rnaService.getRNATSNEData(biosampleId, user);
  }

  @Put('/regenerate')
  @IsWriteEndpoint()
  public async regenerateTPMPlots(
    @Param('biosampleId') biosampleId: string,
    @Body() body: UpdatePlotsBodyDTO,
    @Headers() headers: IncomingHttpHeaders,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      {
        biosampleId,
      },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    await this.rnaService.regenerateTPMPlots(
      biosampleId,
      body.subcat2,
      headers,
      user,
    );
  }

  @Get('/:geneId')
  @Scopes('curation.sample.read')
  async getRNAByGeneId(
    @Param('biosampleId') biosampleId: string,
    @Param('geneId') geneId: number,
    @Query() query: GetRNAByIdQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticRna> {
    return this.rnaService.getRNAByGeneId(geneId, biosampleId, query, user);
  }

  @Get('/tpm/:geneId')
  @Scopes('curation.sample.read')
  async getRNASeqGeneTPM(
    @Param('geneId') geneId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IRNASeqGeneTPMData[]> {
    return this.rnaService.getRNASeqGeneTPM(geneId, user);
  }

  @Put('/:geneId')
  @Scopes('curation.sample.download')
  @IsWriteEndpoint()
  public async updateRNAById(
    @Param('biosampleId') biosampleId: string,
    @Param('geneId') geneId: number,
    @Body() rnaUpdatedBody: UpdateRnaSeqSampleBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      {
        biosampleId,
      },
      user,
    );

    if (
      !isAuthorised
      // if they are only updating outlier, then every curator can do this
      // this would rely only on the scope guard
      && !Object.entries(rnaUpdatedBody).every(
        ([key, value]) => key === 'outlier' && value !== undefined,
      )
    ) {
      throw new ForbiddenException();
    }

    return this.rnaService.updateRNAById(
      rnaUpdatedBody,
      geneId,
      biosampleId,
    );
  }

  @Put('classifier/promote')
  @IsWriteEndpoint()
  public async updateSelectedPrediction(
    @Param('biosampleId') biosampleId: string,
    @Body() data: ClassifierDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      {
        biosampleId,
      },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    return this.rnaService.updateSelectedPrediction(biosampleId, data);
  }

  @Put('classifier/:classifier/:version')
  @IsWriteEndpoint()
  public async updateRNAClassifier(
    @Param('biosampleId') biosampleId: string,
    @Param('classifier') classifier: string,
    @Param('version') version: string,
    @Query() filters: UpdateRNAClassifierFiltersDTO,
    @Body() data: IUpdateRNAClassifier,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const prediction = decodeURIComponent(filters.prediction);
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      {
        biosampleId,
      },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    await this.rnaService.updateRNAClassifier(
      biosampleId,
      classifier,
      version,
      prediction,
      data,
      user,
    );
  }
}
