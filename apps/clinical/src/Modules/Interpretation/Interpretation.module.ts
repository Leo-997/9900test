import { Module } from '@nestjs/common';
import { InterpretationsClient } from 'Clients/Interpretation/Interpretation.client';
import { InterpretationsController } from 'Controllers/Interpretation/Interpretation.controller';
import { InterpretationsService } from 'Services/Interpretation/Interpretation.service';
import { AuthModule } from '../Auth/Auth.module';
import { CommentModule } from '../Comment/Comment.module';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';

@Module({
  imports: [AuthModule, CommentModule, MolecularAlterationsModule],
  controllers: [InterpretationsController],
  providers: [InterpretationsService, InterpretationsClient],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
