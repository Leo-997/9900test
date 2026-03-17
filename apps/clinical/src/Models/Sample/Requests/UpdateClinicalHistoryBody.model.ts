import { IsString } from "class-validator";

export interface IUpdateClinicalHistoryBody {
  clinicalHistory: string;
}

export class UpdateClinicalHistoryBodyDTO 
  implements IUpdateClinicalHistoryBody {
    
  @IsString()
  clinicalHistory: string;
}
