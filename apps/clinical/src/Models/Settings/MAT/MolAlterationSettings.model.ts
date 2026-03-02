import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ToBoolean } from '../../../Utils/Transformers/ToBoolean.util';

export interface IGeneAltSettings {
  showGene?: boolean;
  showAlteration?: boolean;
  showRnaExp?: boolean;
  showPathway?: boolean;
  showReportedAs?: boolean;
  showTargeted?: boolean;
  showMutationType?: boolean;
  showFrequency?: boolean;
  showPrognosticFactor?: boolean;
  showClinicalNotes?: boolean;
}

export interface INonGeneAltSettings {
  showAssay?: boolean;
  showAlteration?: boolean;
  showDescription?: boolean;
  showTargeted?: boolean;
  showClinicalNotes?: boolean;
}

export class GeneAltSettingsDTO implements IGeneAltSettings {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showGene?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showAlteration?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showRnaExp?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPathway?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showReportedAs?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showTargeted?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showMutationType?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showFrequency?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPrognosticFactor?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showClinicalNotes?: boolean;
}

export class NonGeneAltSettingsDTO implements INonGeneAltSettings {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showAssay?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showAlteration?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showDescription?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showTargeted?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showClinicalNotes?: boolean;
}
