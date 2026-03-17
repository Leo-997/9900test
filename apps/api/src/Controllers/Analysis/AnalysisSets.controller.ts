import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import {
  AnalysisSetFiltersDTO,
  DiagnosisFiltersDTO,
  IAnalysisPatient,
  IAnalysisSet,
  ICurationSummary,
  IDiagnosisOptionCombination,
  IMolecularConfirmation,
  TriggerExportBodyDTO,
  UpdateAnalysisSetBodyDTO,
  UpdateCurationSummaryBodyDTO,
  UpdateMolecularConfirmationBodyDTO,
} from 'Models/Analysis/AnalysisSets.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AnalysisSetsService } from 'Services/Analysis/AnalysisSets.service';
import { AuthService } from 'Services/Auth/Auth.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('analysis')
export class AnalysisSetsController {
  constructor(
    @Inject(AnalysisSetsService) private readonly analysisSetsService: AnalysisSetsService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  @Post()
  @Scopes('curation.sample.read')
  public async getAnalysisSets(
    @Body() filters: AnalysisSetFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAnalysisSet[]> {
    return this.analysisSetsService.getAnalysisSets(filters, user);
  }

  @Post('patients')
  @Scopes('curation.sample.read')
  public async getAnalysisPatients(
    @Body() filters: AnalysisSetFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAnalysisPatient[]> {
    return this.analysisSetsService.getAnalysisPatients(filters, user);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  public async getAnalysisPatientsCount(
    @Body() filters: AnalysisSetFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.analysisSetsService.getAnalysisPatientsCount(filters, user);
  }

  @Get('studies')
  @Scopes('curation.sample.read')
  async getAllStudies(
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.analysisSetsService.getAllStudies(user);
  }

  @Post('zero2/category')
  @Scopes('curation.sample.read')
  async getZero2Categories(
    @CurrentUser() user: IUserWithMetadata,
    @Body() body: DiagnosisFiltersDTO,
  ): Promise<string[]> {
    return this.analysisSetsService.getZero2Categories(user, body);
  }

  @Post('zero2/subcategory1')
  @Scopes('curation.sample.read')
  async getZero2Subcategory1(
    @CurrentUser() user: IUserWithMetadata,
    @Body() body: DiagnosisFiltersDTO,
  ): Promise<string[]> {
    return this.analysisSetsService.getZero2Subcategory1(user, body);
  }

  @Post('zero2/subcategory2')
  @Scopes('curation.sample.read')
  async getZero2Subcategory2(
    @CurrentUser() user: IUserWithMetadata,
    @Body() body: DiagnosisFiltersDTO,
  ): Promise<string[]> {
    return this.analysisSetsService.getZero2Subcategory2(user, body);
  }

  @Post('zero2/final-diagnosis')
  @Scopes('curation.sample.read')
  async getZero2FinalDiagnosis(
    @CurrentUser() user: IUserWithMetadata,
    @Body() body: DiagnosisFiltersDTO,
  ): Promise<string[]> {
    return this.analysisSetsService.getZero2FinalDiagnosis(user, body);
  }

  @Get('zero2/diagnosis-option-combinations')
  @Scopes('curation.sample.read')
  async getZero2DiagnosisOptionCombinations(
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDiagnosisOptionCombination[]> {
    return this.analysisSetsService.getZero2DiagnosisOptionCombinations(
      user,
    );
  }

  @Get(':analysisSetId')
  @Scopes('curation.sample.read')
  public async getAnalysisSetById(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IAnalysisSet> {
    return this.analysisSetsService.getAnalysisSetById(analysisSetId, user);
  }

  @Patch(':analysisSetId')
  @IsWriteEndpoint()
  @Scopes('curation.sample.write', 'curation.status.write')
  public async updateAnalysisSetById(
    @Param('analysisSetId') analysisSetId: string,
    @Body() body: UpdateAnalysisSetBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    // Users with 'curation.status.write' are only allowed to
    // update curationStatus and finaliseCase properties
    if (
      (
        (
          body.primaryCuratorId
          || body.secondaryCuratorId
          || body.pseudoStatus
          || body.failedStatusReason
          || body.secondaryCurationStatus
          || body.htsStatus
          || body.expedite
          || body.targetable
          || body.ctcCandidate
          || body.researchCandidate
        )
      ) && !user.scopes.map((s) => s.name).includes('curation.sample.write')
    ) {
      throw new ForbiddenException();
    }

    await this.analysisSetsService.updateAnalysisSetById(analysisSetId, body, user, headers);
  }

  @Get(':analysisSetId/summary')
  @Scopes('curation.sample.read')
  public async getSummaries(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICurationSummary[]> {
    return this.analysisSetsService.getSummaries(analysisSetId, user);
  }

  @Post(':analysisSetId/summary')
  @IsWriteEndpoint()
  public async updateSummary(
    @Param('analysisSetId') analysisSetId: string,
    @Body() body: UpdateCurationSummaryBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    const isAssigned = await this.authService.checkAssignedUserByAnalysis({ analysisSetId }, user);

    if (
      !isAssigned
      && !user.scopes.map((s) => s.name).includes('curation.sample.hts.write')
    ) {
      throw new ForbiddenException();
    }

    await this.analysisSetsService.updateSummary(analysisSetId, body);
  }

  @Post(':analysisSetId/export')
  @IsWriteEndpoint()
  public async triggerExport(
    @Param('analysisSetId') analysisSetId: string,
    @CurrentUser() user: IUserWithMetadata,
    @Body() body: TriggerExportBodyDTO,
  ): Promise<void> {
    let isAllowed = await this.authService.checkAssignedUserByAnalysis({ analysisSetId }, user);

    if (body.type === 'HTS') {
      isAllowed = user.scopes.map((s) => s.name).includes('curation.sample.hts.write') || isAllowed;
    }

    if (!isAllowed) throw new ForbiddenException();

    await this.analysisSetsService.triggerExport(analysisSetId, body);
  }

  @Get(':analysisSetId/molecular-confirmation')
  @Scopes('curation.sample.read')
  public async getMolecularConfirmation(
  @Param('analysisSetId') analysisSetId: string,
  @CurrentUser() user: IUserWithMetadata,
  ): Promise<IMolecularConfirmation> {
    return this.analysisSetsService.getMolecularConfirmation(
      analysisSetId,
      user,
    );
  }

  @Put(':analysisSetId/molecular-confirmation/update')
  @Scopes('curation.sample.write')
  @IsWriteEndpoint()
  public async updateMolecularConfirmation(
    @Param('analysisSetId') analysisSetId: string,
    @Body() body: UpdateMolecularConfirmationBodyDTO,
  ): Promise<void> {
    await this.analysisSetsService.updateMolecularConfirmation(analysisSetId, body);
  }
}
