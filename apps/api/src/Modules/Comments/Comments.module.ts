import { Module } from '@nestjs/common';
import { CommentsClient } from 'Clients/Comments/Comments.client';
import { CommentsController } from 'Controllers/Comments/Comments.controller';
import { EvidenceModule } from 'Modules/Evidence/Evidence.module';
import { CommentsService } from 'Services/Comments/Comments.service';

@Module({
  imports: [EvidenceModule],
  controllers: [CommentsController],
  providers: [CommentsClient, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
