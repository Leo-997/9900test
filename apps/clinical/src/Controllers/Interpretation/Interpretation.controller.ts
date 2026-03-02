import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from 'Models';
import {
  CreateInterpretationBodyDTO,
  IInterpretation,
  InterpretationQueryDTO,
  UpdateInterpretationBodyDTO,
  UpdateInterpretationOrderDTO,
} from 'Models/Interpretation/Interpretation.model';
import { InterpretationsService } from 'Services/Interpretation/Interpretation.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/:clinicalVersionId/interpretations')
export class InterpretationsController {
  constructor(
    @Inject(InterpretationsService) private readonly interpretationsService: InterpretationsService,
  ) {}

  @Post()
  @IsWriteEndpoint()
  async createInterpretation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: CreateInterpretationBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.interpretationsService.createInterpretation(
      clinicalVersionId,
      body,
      user,
    );
  }

  @Get()
  @Scopes('clinical.sample.read')
  async getInterpretations(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Query() query: InterpretationQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IInterpretation[]> {
    return this.interpretationsService.getInterpretations(clinicalVersionId, query, user);
  }

  @Get(':id')
  @Scopes('clinical.sample.read')
  async getInterpretationById(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IInterpretation> {
    return this.interpretationsService.getInterpretationById(clinicalVersionId, id, user);
  }

  @Patch('order')
  @IsWriteEndpoint()
  async updateInterpretationOrder(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Body() body: UpdateInterpretationOrderDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.interpretationsService.updateInterpretationOrder(
      clinicalVersionId,
      body,
      user,
    );
  }

  @Patch(':interpretationId')
  @IsWriteEndpoint()
  async updateInterpretation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('interpretationId') interpretationId: string,
    @Body() body: UpdateInterpretationBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.interpretationsService.updateInterpretation(
      clinicalVersionId,
      interpretationId,
      body,
      user,
    );
  }

  @Delete(':interpretationId')
  @IsWriteEndpoint()
  async deleteInterpretation(
    @Param('clinicalVersionId') clinicalVersionId: string,
    @Param('interpretationId') interpretationId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.interpretationsService.deleteInterpretation(
      clinicalVersionId,
      interpretationId,
      user,
    );
  }
}
