const mapEvent = (ev?: string, includeNumber = false): string => {
  if (!ev) return '';
  let event = ev;
  switch (true) {
    case /^D[0-9]{1}$/.test(ev) || ev.toLowerCase().includes('diagnosis'):
      event = 'Diagnosis';
      break;
    case /^P[0-9]{1}$/.test(ev) || ev.toLowerCase().includes('progression'):
      event = 'Progression';
      break;
    case /^R[0-9]{1}$/.test(ev) || ev.toLowerCase().includes('relapse'):
      event = 'Relapse';
      break;
    case /^S[0-9]{1}$/.test(ev) || ev.toLowerCase().includes('secondary'):
      event = 'Secondary';
      break;
    case /^O[0-9]{1}$/.test(ev) || ev.toLowerCase().includes('other'):
      event = 'Other';
      break;
    default:
      return ev;
  }

  if (includeNumber) {
    const matches = ev.match(/([0-9]+)$/);
    if (matches) {
      return `${event} ${matches[0]}`;
    }
  }

  return event;
};

export default mapEvent;
