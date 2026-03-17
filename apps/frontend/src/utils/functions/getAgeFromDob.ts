import { IPatientDemographics } from '@/types/Patient/Patient.types';
import dayjs from 'dayjs';

interface IAge {
  age: number;
  units: 'Months' | 'Years';
}

export function getAgeFromDob(
  demographics: IPatientDemographics,
  inYears = false,
): IAge {
  const dob = dayjs(demographics.dateOfBirth.replaceAll('-', ' '));
  const { dateOfDeath } = demographics;

  if (!inYears && dayjs(dateOfDeath).diff(dob, 'month') < 23) {
    return {
      age: dayjs(dateOfDeath).diff(dob, 'month'),
      units: 'Months',
    };
  }
  return {
    age: dayjs(dateOfDeath).diff(dob, 'year'),
    units: 'Years',
  };
}
