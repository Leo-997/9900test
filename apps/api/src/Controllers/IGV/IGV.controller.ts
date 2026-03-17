import {
  Body, Controller, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IGVFilterDTO, SampleResponse } from 'Models/IGV/Requests/IGV.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { IGVService } from 'Services/IGV/IGV.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('igv')
export class IGVController {
  constructor(
    private readonly igvService: IGVService,
  ) {}

  @Post('links')
  @Scopes('curation.sample.read')
  public async getSampleLinks(
    @Body() {
      sampleIds,
    }: IGVFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<SampleResponse> {
    return this.igvService.getSampleLinks(sampleIds, user);
  }
}
