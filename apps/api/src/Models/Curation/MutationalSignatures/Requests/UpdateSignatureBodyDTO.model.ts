import { IsBoolean, IsOptional } from 'class-validator';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { Classification, ClassifierClassification } from 'Models/Curation/Misc.model';

export interface IUpdateSignature<
C extends Classification | ClassifierClassification = Classification
> extends Partial<IReportableVariant<C>> {
  researchCandidate?: boolean | null,
}

export class UpdateSignatureBodyDTO<
  C extends Classification | ClassifierClassification = Classification
> extends UpdateReportableVariantDTO<C>
  implements IUpdateSignature<C> {
  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}
