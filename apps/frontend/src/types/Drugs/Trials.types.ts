// Trial in the drugs MS
export interface IExternalTrial {
  id: string;
  name: string;
  trialId: string;
}

export type CreateExternalTrial = Omit<IExternalTrial, 'id'>;

// filters for trials in the Drugs MS
export interface IExternalTrialFilters extends Partial<IExternalTrial> {
  query?: string;
}

export interface ITherapyTrial {
  id: string;
  note?: string;
  externalTrial: IExternalTrial;
}

export interface ICreateTherapyTrial extends Omit<ITherapyTrial, 'id' | 'externalTrial'> {
  externalTrialId: string;
}
