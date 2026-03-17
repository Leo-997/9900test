import { Module } from '@nestjs/common';
import { CommentClient } from '../../Clients';
import { CommentController } from '../../Controllers';
import { CommentService } from '../../Services';
import { AuthModule } from '../Auth/Auth.module';
import { EvidenceModule } from '../Evidence/Evidence.module';
import { SampleModule } from '../Sample/Sample.module';

@Module({
  imports: [AuthModule, EvidenceModule, SampleModule],
  controllers: [CommentController],
  providers: [CommentService, CommentClient],
  exports: [CommentService],
})
export class CommentModule {}
