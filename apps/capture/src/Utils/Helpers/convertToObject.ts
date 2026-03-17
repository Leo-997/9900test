import { IOption } from 'Models/ClinicalOne/ClinicalOne.model';

export default function convertToObject(value: string): IOption[] {
  try {
    return JSON.parse(value)
  } catch {
    return [];
  }
}