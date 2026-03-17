export const recommendationTypes = [
  'THERAPY',
  'CHANGE_DIAGNOSIS',
  'GERMLINE',
  'TEXT',
  'GROUP',
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
