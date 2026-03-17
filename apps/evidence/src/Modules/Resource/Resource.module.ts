import { Module } from "@nestjs/common";
import { ResourceClient } from "Clients/Resource/Resource.client";
import { ResourceController } from "Controllers/Resource/Resource.controller";
import { ResourceService } from "Services/Resource/Resource.service";


@Module({
  imports: [],
  controllers: [ResourceController],
  providers: [ResourceService, ResourceClient],
  exports: [ResourceService],
})
export class ResourceModule {}