import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersService } from 'Services/Users/Users.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
