import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NotificationsService } from 'Services/Notifications/Notifications.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
