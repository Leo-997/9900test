import dayjs, { Dayjs } from 'dayjs';

export type ProgressDates = {
  startDate: Dayjs | null;
  completionDate: Dayjs;
  belowAvgEndDate: Dayjs | null;
  aboveAvgEndDate: Dayjs | null;
};

export function getProgressDates(
  dateStart: string | null,
  dateCompletion: string | null,
  belowAverageDays: number,
  aboveAverageDays: number,
): ProgressDates {
  const startDate = dateStart ? dayjs(dateStart) : null;
  // if stage is not finalised, take current day as reference for end date:
  const completionDate = dateCompletion ? dayjs(dateCompletion) : dayjs();

  const belowAvgEndDate = startDate
    ? dayjs(startDate).businessDaysAdd(belowAverageDays)
    : null;

  const aboveAvgEndDate = startDate
    ? dayjs(startDate).businessDaysAdd(aboveAverageDays)
    : null;

  return {
    startDate,
    completionDate,
    belowAvgEndDate,
    aboveAvgEndDate,
  };
}
