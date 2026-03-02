import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from '../../Decorators/CurrentUser.decorator';
import { Scopes } from '../../Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from '../../Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import {
    ClinicalInformationData,
    ClinicalInformationDataDTO,
    IUserWithMetadata,
} from '../../Models';
import { AuthService, ClinicalInformationService } from '../../Services';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller(':clinicalVersionId/clinical-info/:slideId')
export class ClinicalInformationController {
  constructor(
    private clinicalService: ClinicalInformationService,
    private authService: AuthService,
  ) {}

  @Post('/information')
  @IsWriteEndpoint()
  public async createClinicalInformationBySlideId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() createInformationBody: ClinicalInformationDataDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.clinicalService.createClinicalInformationBySlideId(
      clinicalVersionId,
      slideId,
      createInformationBody,
      user,
    );
  }

  @Get('/information')
  @Scopes('clinical.sample.read')
  public async getClinicalInformationBySlideId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
  ): Promise<ClinicalInformationData | undefined> {
    return this.clinicalService.getClinicalInformationBySlideId(
      clinicalVersionId,
      slideId,
    );
  }

  @Put('/information')
  @IsWriteEndpoint()
  public async updateClinicalInformationBySlideId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @Body() updateInformationBody: ClinicalInformationDataDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.clinicalService.updateClinicalInformationBySlideId(
      clinicalVersionId,
      slideId,
      updateInformationBody,
      user,
    );
  }

  @Delete('/:slideId')
  @IsWriteEndpoint()
  public async deleteClinicalInformationBySlideId(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('slideId') slideId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    const isAuthorised = await this.authService.checkAssignedUser(clinicalVersionId, user);

    if (!isAuthorised) throw new ForbiddenException();

    return this.clinicalService.deleteClinicalInformationBySlideId(
      clinicalVersionId,
      slideId,
      user,
    );
  }
}
