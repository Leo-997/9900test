import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SVService } from 'Services/Curation/SV/SV.service';

import { PaginatedSampleSomaticSVQueryDTO } from 'Models/Curation/SV/Requests/SVSampleQuery.model';
import { UpdateSVSampleBodyDTO } from 'Models/Curation/SV/Requests/UpdateSVBody.model';
import {
  ISomaticSV,
  ISomaticSVSummary,
} from 'Models/Curation/SV/SVSample.model';

import { ConfigService } from '@nestjs/config';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { S3Service } from 'Modules/S3/S3.service';
import { AuthService } from 'Services/Auth/Auth.service';
import { createBedFile } from 'Utilities/misc/createBedFile.util';
import { v4 as uuid } from 'uuid';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/sv')
export class SVController {
  constructor(
    private readonly svService: SVService,
    private readonly s3: S3Service,
    private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getSampleSVs(
    @Param('biosampleId') biosampleId: string,
    @Body()
      { page, limit, ...filters }: PaginatedSampleSomaticSVQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticSV[]> {
    return this.svService.getSampleSVs(biosampleId, filters, user, page, limit);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getSampleSVsCount(
    @Param('biosampleId') biosampleId: string,
    @Body()
      filters: PaginatedSampleSomaticSVQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.svService.getSampleSVsCount(biosampleId, filters, user);
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getSampleSVSummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticSVSummary> {
    return this.svService.getSampleSVSummary(biosampleId, user);
  }

  @Get(':internalId')
  @Scopes('curation.sample.read')
  async getSampleSVById(
    @Param('biosampleId') biosampleId: string,
    @Param('internalId') internalId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticSV> {
    return this.svService.getSampleSVById(biosampleId, internalId, user);
  }

  @Post('/bed-file')
  @Scopes('curation.sample.read')
  async createBedFile(
    @Body() bedFileContent: [],
  ): Promise<string> {
    const buffer: Buffer = createBedFile(bedFileContent);
    const randomKey = uuid();
    const key = `${randomKey}.txt`;
    const bucket = `${this.configService.get('aws.bucket')}/ucsc`;
    const bedFile = await this.s3.postFile(
      key,
      buffer,
      bucket,
    );
    return bedFile.url;
  }

  @Put('/pathclass')
  @IsWriteEndpoint()
  public async clearSvsPathclass(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.svService.clearSvsPathclass(biosampleId);
  }

  @Put(':internalId')
  @IsWriteEndpoint()
  public async updateSampleSVReportingById(
    @Param('biosampleId') biosampleId: string,
    @Param('internalId') internalId: number,
    @Body() svUpdatedBody: UpdateSVSampleBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.svService.updateSampleSVById(
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

  @Put(':internalId/promote/:analysisSetId')
  @IsWriteEndpoint()
  public async promoteSV(
    @Param('biosampleId') biosampleId: string,
    @Param('analysisSetId') analysisSetId: string,
    @Param('internalId') internalId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { analysisSetId },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    return this.svService.promoteSV(biosampleId, analysisSetId, internalId, user);
  }
}
