export const recommendationTypes = [
  'THERAPY',
  'CHANGE_DIAGNOSIS',
  'GERMLINE',
  'TEXT',
  'GROUP',
] as const;

export const recommendationViewTypes = [
  'HTS', // For the HTS past recs modal
  'GROUP', // For the discussion modal
  'MODAL', // For creating/editing recs modal
  'SLIDE', // For the slide view
  'CLINICAL_INFORMATION', // For the clinical information view
  'REPORT', // For use in the reports
] as const;

export const germlineRecOptions = [
  'referralToFCSCounselling',
  'referralToCGSCounselling',
  'clinicalConfirmRecommended',
  'clinicalConfirmConsidered',
  'cancerRiskImplication',
  'eviQRiskManagement',
  'riskManagementTailored',
  'familyPlanningImplication',
] as const;

export const recLinksEntityTypes = [
  'REPORT',
  'SLIDE',
] as const;
