import { Dayjs } from 'dayjs';

export function getProgressPercentage(
  startDate: Dayjs | null,
  completionDate: Dayjs,
  belowAvgEndDate: Dayjs | null,
  aboveAvgEndDate: Dayjs | null,
): number {
  // If we have no start date yet or no time has passed, progress is 0%.
  if (
    !startDate
    || !belowAvgEndDate
    || !aboveAvgEndDate
    || completionDate.isSame(startDate, 'day')
  ) {
    return 0;
  }

  // If aboveAvgEndDate was exceeded, progress is 100%.
  if (completionDate.isAfter(aboveAvgEndDate)) {
    return 100;
  }

  // Scale from 0% to 50% when below or equal to belowAvgEndDate
  // Also accounts for users finishing a stage on a weekend
  // e.g.,if working overtime and completing on a Sunday
  // as diff between a Sunday and a Friday will be zero for dayjs purposes
  if (
    completionDate.isBefore(belowAvgEndDate)
    || completionDate.isSame(belowAvgEndDate, 'day')
  ) {
    return (
      completionDate.businessDiff(startDate)
      / belowAvgEndDate.businessDiff(startDate)
    ) * 50;
  }

  // Otherwise, scale from 50% to 100% when date is in between belowAvgEndDate and aboveAvgEndDate
  return (
    50
    + (completionDate.businessDiff(belowAvgEndDate)
      / aboveAvgEndDate.businessDiff(belowAvgEndDate))
      * 50
  );
}
