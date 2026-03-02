import { IGetReportableVariantData } from '../../../types/Reports/ReportableVariants.types';
import { VariantType } from '../../../types/misc.types';

const filterReportableVariants = (
  reportableVariants: IGetReportableVariantData[],
  variantFilter: VariantType,
) : IGetReportableVariantData[] => (
  reportableVariants.filter((v) => v.variantType === variantFilter)
);

export default filterReportableVariants;
