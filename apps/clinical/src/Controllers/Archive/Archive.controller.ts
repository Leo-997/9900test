import {
  Controller, Get, Inject, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from 'Models';
import { GetArchiveSamplesDTO, IArchiveSample } from 'Models/Archive/Archive.model';
import { ArchiveService } from 'Services/Archive/Archive.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard)
@Controller('archive')
export class ArchiveController {
  constructor(
    @Inject(ArchiveService) private readonly archiveService: ArchiveService,
  ) {}

  @Get('samples')
  @Scopes('clinical.sample.read')
  public async getArchiveSamples(
    @Query() filters: GetArchiveSamplesDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IArchiveSample[]> {
    return this.archiveService.getArchiveSamples(filters, user);
  }

  @Get('samples/count')
  @Scopes('clinical.sample.read')
  public async getArchiveSamplesCount(
    @Query() filters: GetArchiveSamplesDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.archiveService.getArchiveSamplesCount(filters, user);
  }
}
