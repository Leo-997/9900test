import { Module } from '@nestjs/common';
import { ArchiveClient } from 'Clients/Archive/Archive.client';
import { ArchiveController } from 'Controllers/Archive/Archive.controller';
import { ArchiveService } from 'Services/Archive/Archive.service';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';

@Module({
  imports: [MolecularAlterationsModule],
  exports: [ArchiveService],
  controllers: [ArchiveController],
  providers: [ArchiveService, ArchiveClient],
})
export class ArchiveModule {}
