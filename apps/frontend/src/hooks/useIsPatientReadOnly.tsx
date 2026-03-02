import { useEffect, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IAccessiblePatient, IAccessiblePatientQuery } from '@/types/Patient/Patient.types';

export function useIsPatientReadOnly(
  {
    patientId,
    analysisSetId,
    biosampleId,
  }: IAccessiblePatientQuery,
): boolean {
  const zeroDashSdk = useZeroDashSdk();
  const [accessiblePatients, setAccessiblePatients] = useState<IAccessiblePatient[]>([]);

  useEffect(() => {
    if (!patientId && !analysisSetId && !biosampleId) {
      setAccessiblePatients([]);
      return;
    }

    zeroDashSdk.patient.getAccessiblePatients({
      patientId,
      analysisSetId,
      biosampleId,
    })
      .then(setAccessiblePatients);
  }, [analysisSetId, biosampleId, patientId, zeroDashSdk.patient]);

  if (biosampleId) {
    const acRecord = accessiblePatients.find((p) => (
      p.biosampleId === biosampleId
    ));
    return (acRecord?.isReadOnly ?? true); // assume readonly if record not found
  }
  if (analysisSetId) {
    const acRecord = accessiblePatients.find((p) => (
      p.isFullCaseAccess && p.analysisSetId === analysisSetId
    ));
    return (acRecord?.isReadOnly ?? true);
  }
  if (patientId) {
    const acRecord = accessiblePatients.find((p) => (
      p.isFullCaseAccess && p.patientId === patientId
    ));
    return (acRecord?.isReadOnly ?? true);
  }
  return true;
}
