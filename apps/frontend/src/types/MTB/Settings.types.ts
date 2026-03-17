export interface IPatientDiagnosisSettings {
  showOncologist?: boolean;
  showHospital?: boolean;
  showTimeToMtb?: boolean;
  showDiagnosis?: boolean;
  showEvent?: boolean;
  showSampleType?: boolean;
  showTumour?: boolean;
  showGermline?: boolean;
  showEnrolment?: boolean;
  showStudy?: boolean;
  showMsiStatus?: boolean;
  showLOH?: boolean;
  showPreservationState?: boolean;
  showCohort?: boolean;
  showHistologicalDiagnosis?: boolean;
  showCategory?: boolean;
  showCancerType?: boolean;
  showFinalDiagnosis?: boolean;
  showContamination?: boolean;
  showPurity?: boolean;
  showPloidy?: boolean;
  showIPASS?: boolean;
  showTumourMutationMb?: boolean;
}

export interface IGeneAltSettings {
  showGene?: boolean;
  showAlteration?: boolean;
  showRnaExp?: boolean;
  showPathway?: boolean;
  showReportedAs?: boolean;
  showTargeted?: boolean;
  showMutationType?: boolean;
  showFrequency?: boolean;
  showPrognosticFactor?: boolean;
  showClinicalNotes?: boolean;
}

export interface INonGeneAltSettings {
  showAssay?: boolean;
  showAlteration?: boolean;
  showDescription?: boolean;
  showTargeted?: boolean;
  showClinicalNotes?: boolean;
}

export interface ITumourMolecularProfileSettings {
  showMutBurden?: boolean;
  showPurity?: boolean;
  showMSI?: boolean;
  showLOH?: boolean;
  showPloidy?: boolean;
}

export interface ITumourImmuneProfileSettings {
  showIPASS?: boolean;
  showM1M2?: boolean;
  showCD8?: boolean;
}
