import {
  Controller, Get, Inject, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IPurity, PurityFiltersDTO } from 'Models/Precuration/Purity.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { PurityService } from 'Services/Precuration/Purity.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('purity')
export class PurityController {
  constructor(
    @Inject(PurityService) private readonly purityService: PurityService,
  ) {}

  @Get()
  @Scopes('curation.sample.read')
  public async getPurity(
    @Query() filters: PurityFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPurity[]> {
    return this.purityService.getPurity(filters, user);
  }

  @Get(':id')
  @Scopes('curation.sample.read')
  public async getPurityById(
    @Param('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IPurity[]> {
    return this.purityService.getPurityById(id, user);
  }
}
