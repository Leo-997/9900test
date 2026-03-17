import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { NotFoundError } from 'Errors/NotFound.error';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { GetReportableVariantDTO } from 'Models/Common/Requests/GetReportableVariant.model';
import { ISignatureData } from 'Models/Curation/MutationalSignatures/MutationalSignatures.model';
import { UpdateSignatureBodyDTO } from 'Models/Curation/MutationalSignatures/Requests/UpdateSignatureBodyDTO.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AuthService } from 'Services/Auth/Auth.service';
import { MutationalSignaturesService } from 'Services/Curation/MutationalSignatures/MutationalSignatures.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/curation/:biosampleId/signatures')
export class MutationalSignaturesController {
  constructor(
    private readonly mutationalSignaturesService: MutationalSignaturesService,
    private readonly authService: AuthService,
  ) {}

  @Get('')
  @Scopes('curation.sample.read')
  async getSigData(
    @Param('biosampleId') biosampleId: string,
    @Query() filters: GetReportableVariantDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISignatureData[]> {
    const data = await this.mutationalSignaturesService.getSigData(
      biosampleId,
      filters,
      user,
    );
    return data;
  }

  @Get(':variantId')
  @Scopes('curation.sample.read')
  async getSigById(
    @Param('biosampleId') biosampleId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ISignatureData> {
    const data = await this.mutationalSignaturesService.getSigById(
      biosampleId,
      variantId,
      user,
    );
    return data;
  }

  @Put('update/:sig')
  @IsWriteEndpoint()
  public async updateSigs(
    @Param('biosampleId') biosampleId: string,
    @Param('sig') sig: string,
    @Body() updatedSigBody: UpdateSignatureBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<{ message: string }> {
    const isAuthorised = await this.authService.checkAssignedUserByAnalysis({ biosampleId }, user);

    if (!isAuthorised) throw new ForbiddenException();

    const numRowsUpdated = await this.mutationalSignaturesService.updateSigs(
      biosampleId,
      sig,
      updatedSigBody,
    );

    if (numRowsUpdated) {
      return {
        message: `${numRowsUpdated} records updated`,
      };
    }

    throw new NotFoundError('Could not find methylation sample to update');
  }
}
