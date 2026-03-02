import {
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

import { GermlineSnvService } from 'Services/Curation/SNV/GermlineSnv.service';

import { IGermlineSnv, IReportableGermlineSNV } from 'Models/Curation/GermlineSnv/CuratedSampleGermlineSnv.model';
import { PaginatedSampleGermlineSnvQueryDTO } from 'Models/Curation/GermlineSnv/Requests/CuratedSampleGermlineSnvQuery.model';
import { UpdateSampleGermlineSnvBodyDTO } from 'Models/Curation/GermlineSnv/Requests/UpdateSampleGermlineSnvBody.model';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { BadRequestError } from 'Errors/BadRequest.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { ChromPosRefAltDTO } from 'Models/Curation/GermlineSnv/Requests/ChromosomePosition.model';
import { GetVariantZygosityQuery, IGetVariantZygosityResp } from 'Models/Curation/GermlineSnv/Requests/GetVariantZygosityQuery.model';
import { HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/germlinesnv')
export class GermlineSnvController {
  constructor(
    private readonly germlineSnvService: GermlineSnvService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineSnvs(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: PaginatedSampleGermlineSnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineSnv[]> {
    return this.germlineSnvService.getCuratedSampleGermlineSnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
  }

  @Get('reportable')
  @Scopes('curation.sample.read')
  async getReportableGermlineSnvs(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IReportableGermlineSNV[]> {
    return this.germlineSnvService.getReportableGermlineSnvs(biosampleId, user);
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getSampleSVSummary(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    return this.germlineSnvService.getSampleHeliumSummary(biosampleId, user);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineSnvsCount(
    @Param('biosampleId') biosampleId: string,
    @Body() filters: PaginatedSampleGermlineSnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.germlineSnvService.getCuratedSampleGermlineSnvsCount(
      biosampleId,
      filters,
      user,
    );
  }

  @Get('/zygosity')
  @Scopes('curation.sample.read')
  async getVariantZygosity(
    @Param('biosampleId') biosampleId: string,
    @Query() query: GetVariantZygosityQuery,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGetVariantZygosityResp[]> {
    return this.germlineSnvService.getVariantZygosity(
      biosampleId,
      query,
      user,
    );
  }

  @Get('')
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineSnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Query() cpra: ChromPosRefAltDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineSnv> {
    return this.germlineSnvService.getCuratedSampleGermlineSnvByVariantId(
      biosampleId,
      cpra,
      user,
    );
  }

  @Put('/pathclass')
  @IsWriteEndpoint()
  async clearSnvsPathclass(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.germlineSnvService.clearSnvsPathclass(biosampleId);
  }

  @Put()
  @IsWriteEndpoint()
  async updateCuratedSampleGermlinSnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Body() snvUpdateBody: UpdateSampleGermlineSnvBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { biosampleId },
      user,
    );

    if (!isAuthorised) throw new ForbiddenException();

    if (Object.values(snvUpdateBody).every((v) => v === undefined)) {
      throw new BadRequestError(
        'At least one value must be set to update the variant',
      );
    }
    const numRowsUpdated = await this.germlineSnvService.updateCuratedSampleGermlineSnvByVariantId(
      snvUpdateBody,
      biosampleId,
      user,
    );

    return {
      message: `${numRowsUpdated} records updated`,
    };
  }
}
