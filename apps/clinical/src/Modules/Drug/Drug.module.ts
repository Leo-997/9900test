import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DrugClient } from '../../Clients';
import { DrugController } from '../../Controllers';
import { DrugService } from '../../Services';
import { TrialsModule } from '../Trials/Trials.module';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [TrialsModule, AuthModule, HttpModule],
  controllers: [DrugController],
  providers: [DrugService, DrugClient],
  exports: [DrugService],
})
export class DrugModule {}
