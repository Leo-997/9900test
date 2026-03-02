import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PubmedService } from 'Services/Misc/Pubmed.service';

@Module({
  imports: [HttpModule],
  providers: [PubmedService],
})
export class PubmedModule {}
