import { IConfirmedDiagnosisForm } from 'Models/ClinicalOne/ClinicalOne.model';

export default function getHistologicDiagnosis(form: IConfirmedDiagnosisForm): string | null {
  const diagnosis = form['Pre-molecular histology or immunophenotype-based diagnosis'][0]?.label || '';
  if (diagnosis === 'Unlisted') {
    return form['Unlisted, please specify'] || null;
  }

  return diagnosis || null;
}
