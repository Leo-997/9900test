import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';

export interface ITumourMolecularProfileSettings {
  showMutBurden?: boolean;
  showPurity?: boolean;
  showMSI?: boolean;
  showLOH?: boolean;
  showPloidy?: boolean;
}

export interface ITumourImmuneProfileSettings {
  showIPASS?: boolean;
  showM1M2?: boolean;
  showCD8?: boolean;
}

export class TumourMolecularProfileSettingsDTO implements ITumourMolecularProfileSettings {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showMutBurden?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPurity?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showMSI?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showLOH?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPloidy?: boolean;
}

export class TumourImmuneProfileSettingsDTO implements ITumourImmuneProfileSettings {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showIPASS?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showM1M2?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showCD8?: boolean;
}
