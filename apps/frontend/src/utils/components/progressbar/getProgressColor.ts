import { corePalette } from '@/themes/colours';
import { Dayjs } from 'dayjs';

export function getProgressColor(
  startDate: Dayjs | null,
  completionDate: Dayjs,
  belowAvgEndDate: Dayjs | null,
  aboveAvgEndDate: Dayjs | null,
): string {
  // Strictly do not need to account for this case, as bar would be empty (value={0})
  if (!startDate || !belowAvgEndDate || !aboveAvgEndDate) return corePalette.green150;

  if (completionDate.isAfter(aboveAvgEndDate)) return corePalette.warmRed200;

  if (
    completionDate.isAfter(belowAvgEndDate)
    && (
      completionDate.isBefore(aboveAvgEndDate)
      || completionDate.isSame(aboveAvgEndDate)
    )
  ) return corePalette.yellow200;

  // If script reaches this point, comparisonDate is below average end date
  return corePalette.green150;
}
