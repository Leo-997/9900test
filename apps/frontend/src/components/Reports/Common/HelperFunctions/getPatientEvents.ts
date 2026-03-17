import dayjs from 'dayjs';
import { IEvent } from '../../../../types/Patient/Patient.types';
import mapEvent from '../../../../utils/functions/mapEvent';

export function getPatientEvents(events: IEvent[]): string {
  const eventStrings = events
    .filter((e) => e.date && e.event && e.eventNumber)
    .filter((e) => dayjs(e.date.replaceAll('-', ' ')).isValid())
    .sort((a, b) => (
      dayjs(a.date.replaceAll('-', ' '))
        .diff(b.date.replaceAll('-', ' '))
    ))
    .map(
      (e) => `${e.otherClinicalScenarios
        ? `${e.otherClinicalScenarios} ${e.eventNumber}`
        : `${mapEvent(e.event)} ${e.eventNumber}`
      } (${dayjs(e.date.replaceAll('-', ' ')).format('DD/MM/YYYY')})`,
    );
  const uniqueEvents = new Set(eventStrings);
  return (Array.from(uniqueEvents)).join('; ');
}
