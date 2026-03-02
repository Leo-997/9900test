import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import {
  CreateMolecularAlterationsGroupDTO,
  IMolAlterationSampleDetails,
  IMolecularAlterationDetail,
  IUserWithMetadata,
  MolecularAlterationQueryDTO,
  UpdateMolAlterationSummaryOrderDTO,
  UpdateMolecularAlterationBodyDTO,
} from 'Models';
import { Scopes } from '../../Decorators/Scope/Scope.decorator';
import { ScopeGuard } from '../../Guards/Scope/ScopeGuard.guard';
import { MolecularAlterationsService } from '../../Services/MolecularAlterations/MolecularAlterations.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/:clinicalVersionId/mol-alterations')
export class MolecularAlterationsController {
  constructor(
    private readonly molAlterationsService: MolecularAlterationsService,
  ) {}

  @Post('group')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async createMolecularAlterationsGroup(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: CreateMolecularAlterationsGroupDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.molAlterationsService.createMolecularAlterationsGroup(
      clinicalVersionId,
      body,
      user,
    );
  }

  @Put('group/:groupId')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async updateMolecularAlterationsGroup(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('groupId') groupId: string,
    @Body() body: CreateMolecularAlterationsGroupDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.molAlterationsService.updateMolecularAlterationsGroup(
      clinicalVersionId,
      groupId,
      body,
      user,
    );
  }

  @Delete('group/:groupId')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async deleteMolecularAlterationsGroup(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    return this.molAlterationsService.deleteMolecularAlterationsGroup(
      clinicalVersionId,
      groupId,
    );
  }

  @Get('')
  @Scopes('clinical.sample.read')
  async getMolecularAlterations(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Query() query: MolecularAlterationQueryDTO,
  ): Promise<IMolecularAlterationDetail[]> {
    return this.molAlterationsService.getMolecularAlterations(clinicalVersionId, query);
  }

  @Put('/order')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  public async updateMolAlterationSummaryOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: UpdateMolAlterationSummaryOrderDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.molAlterationsService.updateMolAlterationSummaryOrder(
      clinicalVersionId,
      body,
      user,
    );
  }

  @Put(':molAlterationId')
  @Scopes('clinical.sample.write')
  @IsWriteEndpoint()
  async updateMolAlteration(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('molAlterationId') molAlterationId: string,
    @Body() updateBodyDTO: UpdateMolecularAlterationBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.molAlterationsService.updateMolAlteration(
      clinicalVersionId,
      molAlterationId,
      updateBodyDTO,
      user,
    );
  }

  @Get(':molAlterationId')
  @Scopes('clinical.sample.read')
  async getMolAlterationById(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('molAlterationId') molAlterationId: string,
  ): Promise<IMolecularAlterationDetail> {
    return this.molAlterationsService.getMolAlterationById(
      clinicalVersionId,
      molAlterationId,
    );
  }

  @Get('/sample-details/:groupId/:molAlterationId')
  @Scopes('clinical.sample.read')
  public async getMolAlterationDetails(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('groupId') groupId: string,
    @Param('molAlterationId') molAlterationId: string,
  ): Promise<IMolAlterationSampleDetails> {
    return this.molAlterationsService.getMolAlterationDetails(
      clinicalVersionId,
      groupId,
      molAlterationId,
    );
  }
}
