import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { SampleModule } from '../Sample/Sample.module';

@Global()
@Module({
  imports: [SampleModule, HttpModule],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
