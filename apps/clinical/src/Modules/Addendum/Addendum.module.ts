import { Module } from '@nestjs/common';
import { AddendumClient } from 'Clients/Addendum/Addendum.client';
import { AddendumController } from 'Controllers/Addendum/Addendum.controller';
import { AddendumService } from 'Services/Addendum/Addendum.service';

@Module({
  controllers: [AddendumController],
  providers: [AddendumService, AddendumClient],
  exports: [AddendumService],
})
export class AddendumModule {}
