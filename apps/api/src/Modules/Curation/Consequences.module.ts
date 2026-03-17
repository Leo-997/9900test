import { Module } from "@nestjs/common";
import { ConsequencesClient } from "Clients/Curation/Consequences/Conequences.client";
import { ConsequencesController } from "Controllers/Curation/Consequences/Consequences.controller";
import { ConsequencesService } from "Services/Curation/Consequences/Consequences.service";

@Module({
  imports: [],
  controllers: [ConsequencesController],
  providers: [ConsequencesService, ConsequencesClient],
})
export class ConsequencesModule {}