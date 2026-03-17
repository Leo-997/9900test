/* COMMON THERAPY TYPES */
export interface ITherapyBase {
  id: string;
  chemotherapy: boolean;
  chemotherapyNote?: string;
  radiotherapy: boolean;
  radiotherapyNote?: string;
}

export interface ITherapyOption {
  includeOption: boolean;
  note?: string;
}
