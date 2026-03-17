import {
  Body, Controller, ForbiddenException, Get, Inject, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IGermlineSV, IGermlineSVSummary } from 'Models/Curation/GermlineSV/GermlineSvSample.model';
import { PaginatedSampleGermlineSVQueryDTO } from 'Models/Curation/GermlineSV/Requests/GermlineSvSampleQuery.model';
import { UpdateGermlineSVSampleBodyDTO } from 'Models/Curation/GermlineSV/Requests/UpdateGermlineSVBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { S3Service } from 'Modules/S3/S3.service';
import { AuthService } from 'Services/Auth/Auth.service';
import { GermlineSVCurationService } from 'Services/Curation/SV/GermlineSv.service';
import { createBedFile } from 'Utilities/misc/createBedFile.util';
import { v4 as uuid } from 'uuid';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/germlinesv')
export class GermlineSvController {
  constructor(
    private readonly germlineSVService: GermlineSVCurationService,
    private readonly s3: S3Service,
    private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getGermlineSVs(
    @Param('biosampleId') biosampleId: string,
    @Body()
      { page, limit, ...filters }: PaginatedSampleGermlineSVQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineSV[]> {
    return this.germlineSVService.getGermlineSVs(biosampleId, filters, user, page, limit);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getSampleGermlineSVsCount(
    @Param('biosampleId') biosampleId: string,
    @Body()
      filters: PaginatedSampleGermlineSVQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.germlineSVService.getSampleGermlineSVsCount(biosampleId, filters, user);
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getSampleSVSummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineSVSummary> {
    return this.germlineSVService.getGermlineSVSummary(biosampleId, user);
  }

  @Get(':internalId')
  @Scopes('curation.sample.read')
  async getSampleGermlineSVById(
    @Param('biosampleId') biosampleId: string,
    @Param('internalId') internalId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineSV> {
    return this.germlineSVService.getSampleGermlineSVById(biosampleId, internalId, user);
  }

  @Put('/pathclass')
  @IsWriteEndpoint()
  async clearSvsPathclass(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.germlineSVService.clearSvsPathclass(biosampleId);
  }

  @Put(':internalId/promote/:analysisSetId')
  @IsWriteEndpoint()
  public async promoteGermlineSV(
    @Param('biosampleId') biosampleId: string,
    @Param('internalId') internalId: string,
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.germlineSVService.promoteGermlineSV(biosampleId, internalId, analysisSetId, user);
  }

  @Put(':internalId')
  @IsWriteEndpoint()
  public async updateGermlineSVById(
    @Param('biosampleId') biosampleId: string,
    @Param('internalId') internalId: string,
    @Body() svUpdatedBody: UpdateGermlineSVSampleBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.germlineSVService.updateGermlineSVById(
      svUpdatedBody,
      biosampleId,
      internalId,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find Somatic SV sample to update');
  }

  @Post('/bed-file')
  @Scopes('curation.sample.read')
  async createBedFile(
    @Body() bedFileContent: [],
  ): Promise<string> {
    const randomKey = uuid();
    const key = `${randomKey}.txt`;
    const bucket = `${this.configService.get('aws.bucket')}/ucsc`;
    const buffer: Buffer = createBedFile(bedFileContent);
    const bedFile = await this.s3.postFile(
      key,
      buffer,
      bucket,
    );
    return bedFile.url;
  }
}
