import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DNANexusService } from './DNANexus.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [DNANexusService],
  exports: [DNANexusService],
})
export class DNANexusModuleConfig {}
