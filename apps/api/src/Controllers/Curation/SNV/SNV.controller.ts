import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ISomaticSnv, SNVVariantSeenInBiosampleDTO } from 'Models/Curation/SNV/CuratedSampleSomaticSNV.model';
import { PaginatedSampleSomaticSnvQueryDTO } from 'Models/Curation/SNV/Requests/CuratedSampleSomaticSNVsQuery.model';
import { UpdateCuratedSampleSomaticSNVsByIdBodyDTO } from 'Models/Curation/SNV/Requests/UpdateCuratedSampleSomaticSNVsByIdBody.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { SnvCurationService } from 'Services/Curation/SNV/SNV.service';
import type { VariantSeenInBiosample } from '@zero-dash/types/dist/src/variants/Variants.types';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/snv')
export class SnvCurationController {
  constructor(
    private readonly snvService: SnvCurationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticSnvs(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: PaginatedSampleSomaticSnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticSnv[]> {
    return this.snvService.getCuratedSampleSomaticSnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticSnvsCount(
    @Param('biosampleId') biosampleId: string,
    @Body() filters: PaginatedSampleSomaticSnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.snvService.getCuratedSampleSomaticSnvsCount(biosampleId, filters, user);
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getSampleSVSummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    return this.snvService.getSampleHeliumSummary(biosampleId, user);
  }

  @Get(':variantId')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticSnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticSnv> {
    return this.snvService.getCuratedSampleSomaticSnvByVariantId(
      biosampleId,
      variantId,
      user,
    );
  }

  @Get(':variantId/seen-in')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticSnvSeenIn(
    @Param('variantId') variantId: string,
    @CurrentUser() user: IUserWithMetadata,
    @Query() query: SNVVariantSeenInBiosampleDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.snvService.getSeenInByVariantId(variantId, user, query);
  }

  @Put('/pathclass')
  @IsWriteEndpoint()
  async clearSnvsPathclass(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.snvService.clearSnvsPathclass(biosampleId);
  }

  @Put('/:snvId')
  @IsWriteEndpoint()
  async updateCuratedSampleSomaticSnvById(
    @Param('biosampleId') biosampleId: string,
    @Param('snvId') snvId: number,
    @Body() body: UpdateCuratedSampleSomaticSNVsByIdBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    if (
      Object.values(body).every((v) => v === undefined)
    ) {
      throw new BadRequestException(
        'At least one property must be defined for update',
      );
    }

    return this.snvService.updateCuratedSampleSomaticSnvById(
      body,
      snvId,
      biosampleId,
    );
  }
}
