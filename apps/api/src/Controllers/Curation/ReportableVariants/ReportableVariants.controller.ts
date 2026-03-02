import {
  Body, Controller,
  ForbiddenException,
  Get, Inject, Param, Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { ReportableVariantBodyDTO } from 'Models/Curation/ReportableVariants/ReportableVariantsBody';
import { IGetReportableVariantData, ReportableVariantQueryDTO } from 'Models/Curation/ReportableVariants/ReportableVariantsQuery';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { ReportableVariantsService } from 'Services/ReportableVariants/ReportableVariants.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:analysisSetId/reportable-variants')
export class ReportableVariantsController {
  constructor(
    @Inject(ReportableVariantsService)
    private readonly reportableVariantsService: ReportableVariantsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  public async getReportableVariants(
    @Query() query: ReportableVariantQueryDTO,
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IGetReportableVariantData[]> {
    return this.reportableVariantsService.getReportableVariants(
      analysisSetId,
      query,
      user,
    );
  }

  @Put(':biosampleId')
  @IsWriteEndpoint()
  public async updateReportableVariant(
    @Body() body: ReportableVariantBodyDTO,
    @Param('analysisSetId') analysisSetId: string,
    @Param('biosampleId') biosampleId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis(
      { analysisSetId },
      user,
    );

    const canUpdateHTS = (
      ['HTS', 'HTS_COMBINATION'].includes(body.variantType)
      && user.scopes.map((s) => s.name).includes('curation.sample.hts.write')
    );

    if (
      !isAuthorised
      && !canUpdateHTS
    ) throw new ForbiddenException();

    return this.reportableVariantsService.updateReportableVariant(analysisSetId, biosampleId, body);
  }
}
