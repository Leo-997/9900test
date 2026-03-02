import { useSnackbar } from 'notistack';
import {
  createContext, useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { IPatient } from '../types/Patient/Patient.types';
import { useUser } from './UserContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface IActivePatient {
  patient: IPatient;
  updateClinicalHistory: (newHistory: string) => void;
  isReadOnly: boolean;
  error?: string;
}

export const PatientContext = createContext<IActivePatient | undefined>(undefined);
PatientContext.displayName = 'PatientContext';

export const usePatient = (): IActivePatient => {
  const ctx = useContext(PatientContext);

  if (!ctx) {
    throw new Error('Patient context is not available at this scope');
  }

  return ctx;
};

export function PatientProvider(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { users } = useUser();
  const { patientId } = useParams();
  const isReadOnly = useIsPatientReadOnly({ patientId });

  const [patient, setPatient] = useState<IPatient>({} as IPatient);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function getPatient(): Promise<void> {
      if (patientId) {
        try {
          const patientData = await zeroDashSdk.patient.getPatientById(patientId);
          setPatient(patientData);
        } catch (err) {
          console.error(err);
          setError('Could not load patient data');
        }
      }
    }

    getPatient();
  }, [patientId, zeroDashSdk.patient, users]);

  const updateClinicalHistory = useCallback(async (newHistory: string) => {
    try {
      await zeroDashSdk.patient.updatePatient(
        patient.patientId,
        {
          clinicalHistory: newHistory,
        },
      );
      setPatient((prev) => ({
        ...prev,
        clinicalHistory: newHistory,
      }));
    } catch {
      enqueueSnackbar('Could not update clinical history, please try again', { variant: 'error' });
    }
  }, [enqueueSnackbar, patient.patientId, zeroDashSdk.patient]);

  const value = useMemo(() => ({
    patient,
    updateClinicalHistory,
    isReadOnly,
    error,
  }), [
    patient,
    updateClinicalHistory,
    isReadOnly,
    error,
  ]);

  return (
    <PatientContext.Provider
      value={value}
    >
      <Outlet />
    </PatientContext.Provider>
  );
}
