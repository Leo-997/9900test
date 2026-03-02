import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Summary } from 'Models/Curation/Misc.model';
import { GermlineCnvService } from 'Services/Curation/CNV/GermlineCnv.service';

import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IGermlineCnv } from 'Models/Curation/GermlineCNV/CuratedSampleGermlineCnv.model';
import { PaginatedSampleGermlineCnvQueryDTO } from 'Models/Curation/GermlineCNV/Requests/CuratedSampleGermlineCnvQuery.model';
import { UpdateSampleGermlineCnvBodyDTO } from 'Models/Curation/GermlineCNV/Requests/UpdateSampleGermlineCnvBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import type { VariantSeenInBiosample } from '@zero-dash/types';
import { PaginationDTO } from '@zero-dash/types/dist/src/common/Pagination.types';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/germlinecnv')
export class GermlineCnvController {
  constructor(
    private readonly germlineCnvService: GermlineCnvService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineCnvs(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: PaginatedSampleGermlineCnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineCnv[]> {
    return this.germlineCnvService.getCuratedSampleGermlineCnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
  }

  @Post('count')
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineCnvsCount(
    @Param('biosampleId') biosampleId: string,
    @Body() { ...filters }: PaginatedSampleGermlineCnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.germlineCnvService.getCuratedSampleGermlineCnvsCount(
      biosampleId,
      filters,
      user,
    );
  }

  @Get('summary')
  @Scopes('curation.sample.read')
  async getSampleCopyNumberSummary(
    @Param('biosampleId') biosampleId: string,
  ): Promise<Summary> {
    return this.germlineCnvService.getSampleCopyNumberSummary(biosampleId);
  }

  @Get('/:variantId')
  @Scopes('curation.sample.read')
  async getCuratedSampleGermlineCnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId', ParseIntPipe) variantId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGermlineCnv> {
    return this.germlineCnvService.getCuratedSampleGermlineCnvByVariantId(
      biosampleId,
      variantId,
      user,
    );
  }

  @Put('/pathclass')
  @IsWriteEndpoint()
  async clearCnvsPathclass(
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.germlineCnvService.clearCnvsPathclass(biosampleId);
  }

  @Put('/:variantId')
  @IsWriteEndpoint()
  async updateCuratedSampleGermlineCnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() cnvUpdateBody: UpdateSampleGermlineCnvBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.germlineCnvService.updateCuratedSampleGermlineCnvByVariantId(
      cnvUpdateBody,
      biosampleId,
      variantId,
    );
  }

  @Get(':geneId/seen-in')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticSnvSeenIn(
    @Param('geneId') geneId: string,
    @CurrentUser() user: IUserWithMetadata,
    @Query() query: PaginationDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.germlineCnvService.getSeenInByGeneId(geneId, user, query);
  }
}
