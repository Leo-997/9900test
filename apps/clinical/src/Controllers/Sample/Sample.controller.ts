import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import {
  ISampleData,
  ISampleFilters,
  IUserWithMetadata,
  ReviewerBodyDTO,
  UpdateClinicalVersionDataDTO,
  UpdateReviewDTO,
} from 'Models';
import { IClinicalVersion } from 'Models/ClinicalVersion/ClinicalVersion.model';
import { Group } from 'Models/Group/Group.model';
import { AuthService, SampleService } from 'Services';
import { CurrentUser } from '../../Decorators/CurrentUser.decorator';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/sample')
export class SampleController {
  constructor(
    @Inject(SampleService) private sampleService: SampleService,
    private readonly authService: AuthService,
  ) {}

  @Put('/:clinicalVersionId/review-status')
  @IsWriteEndpoint()
  public async updateReviewStatus(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() updateReviewBody: UpdateReviewDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    try {
      return await this.sampleService.updateReviewStatus(
        clinicalVersionId,
        updateReviewBody,
        user,
        headers,
      );
    } catch {
      throw new BadRequestException('Unable to update the review status with the details provided');
    }
  }

  @Put(':clinicalVersionId')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  async updateClinicalVersionData(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() data: UpdateClinicalVersionDataDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (Object.values(data).every((value) => value === undefined)) {
      throw new BadRequestException('At least one value must be set to update the record');
    }

    const isAssignedUser = await this.authService.checkAssignedUser(clinicalVersionId, user);
    const isUnassignedUserUpdateAllowed = data.status
        || data.pseudoStatus !== undefined
        || data.isGermlineOnly !== undefined
        || data.clinicianId !== undefined
        || data.curatorId !== undefined
        || data.cancerGeneticistId !== undefined;

    if (!isAssignedUser && !isUnassignedUserUpdateAllowed) throw new ForbiddenException();

    return this.sampleService.updateClinicalVersionData(
      clinicalVersionId,
      data,
      user,
      headers,
    );
  }

  @Get('/:analysisSetId/version/latest')
  @Scopes('clinical.sample.read')
  async getLatestClinicalVersion(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IClinicalVersion> {
    return this.sampleService.getLatestClinicalVersion(user, analysisSetId);
  }

  @Get('/version/:versionId')
  @Scopes('clinical.sample.read')
  async getClinicalVersion(
    @Param('versionId') versionId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IClinicalVersion> {
    return this.sampleService.getClinicalVersion(user, versionId);
  }

  @Post('/:clinicalVersionId/reviewer')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async addReviewer(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() reviewerBody: ReviewerBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    return this.sampleService.addReviewer(
      clinicalVersionId,
      reviewerBody,
      user,
      headers,
    );
  }

  @Delete('/:clinicalVersionId/:group')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async removeReviewer(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('group') group: Group,
  ): Promise<void> {
    try {
      return await this.sampleService.removeReviewer(
        clinicalVersionId,
        group,
      );
    } catch {
      throw new BadRequestException('Unable to remove the clinical reviewer with the details provided');
    }
  }

  @Post()
  @Scopes('clinical.sample.read')
  async getClinicalRecords(
    @Body() filters: ISampleFilters,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISampleData[]> {
    return this.sampleService.getClinicalRecords(filters, user);
  }

  @Post('/count')
  @Scopes('clinical.sample.read')
  async getClinicalRecordsCount(
    @Body() filters: ISampleFilters,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.sampleService.getClinicalRecordsCount(filters, user);
  }
}
