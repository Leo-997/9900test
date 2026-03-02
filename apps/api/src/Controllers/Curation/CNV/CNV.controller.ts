import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CnvCurationService } from 'Services/Curation/CNV/CNV.service';

import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { ISomaticCnv } from 'Models/Curation/CNV/CuratedSampleSomaticCnv.model';
import { PaginatedSampleSomaticCnvQueryDTO } from 'Models/Curation/CNV/Requests/CuratedSampleSomaticCnvsQuery.model';
import { UpdateSampleSomaticCnvBodyDTO } from 'Models/Curation/CNV/Requests/UpdateSampleSomaticCnvBody.model';
import { CNVSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/cnv')
export class CnvCurationController {
  constructor(
    private readonly cnvService: CnvCurationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticCnvs(
    @Param('biosampleId') biosampleId: string,
    @Body() { page, limit, ...filters }: PaginatedSampleSomaticCnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticCnv[]> {
    return this.cnvService.getCuratedSampleSomaticCnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
  }

  @Post('/count')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticCnvCount(
    @Param('biosampleId') biosampleId: string,
    @Body() { ...filters }: PaginatedSampleSomaticCnvQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.cnvService.getCuratedSampleSomaticCnvCount(biosampleId, filters, user);
  }

  @Get('/summary')
  @Scopes('curation.sample.read')
  async getSampleCopyNumberSummary(
    @Param('biosampleId') biosampleId: string,
  ): Promise<CNVSummary> {
    return this.cnvService.getSampleCopyNumberSummary(biosampleId);
  }

  @Get('/:variantId')
  @Scopes('curation.sample.read')
  async getCuratedSampleSomaticCnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId', ParseIntPipe) variantId: number,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISomaticCnv> {
    return this.cnvService.getCuratedSampleSomaticCnvByVariantId(
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

    return this.cnvService.clearCnvsPathclass(biosampleId);
  }

  @Put('/:variantId')
  @IsWriteEndpoint()
  async updateCuratedSampleSomaticCnvByVariantId(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() cnvUpdateBody: UpdateSampleSomaticCnvBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.cnvService.updateCuratedSampleSomaticCnvByVariantId(
      cnvUpdateBody,
      variantId,
      biosampleId,
    );

    return {
      message: `${numRowsUpdated} records updated`,
    };
  }
}
