import { IsIn, IsOptional } from 'class-validator';
import { screenStatuses } from 'Constants/HTS/HTS.constant';
import { ScreenStatus } from '../HTS.model';

export interface IUpdateHTSCultureBody {
  screenStatus?: ScreenStatus;
}

export class UpdateHTSCultureDTO implements IUpdateHTSCultureBody {
  @IsOptional()
  @IsIn(screenStatuses)
    screenStatus?: ScreenStatus;
}
