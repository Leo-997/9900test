import { ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { GermlineCommentTypes, MolecularCommentTypes } from '@/types/Comments/CurationComments.types';
import { commentTagColours, commonCommentTags } from '../Common/comments';
import { germlineCommentTags } from '../Curation/comments';

// slate js format
export const clinicalNotesDefaultText = '{"value":[{"type":"p","children":[{"text":"Diagnosed with <insert cancer type> in <month 20XX>\\nRelevant clinical information: <insert from germline CRF; include prior genetic test results here and any prior malignancy/tumour diagnosis in same format as above> OR <No relevant clinical features reported>\\nRelevant family history of cancer: <insert from germline CRF> OR <No relevant family history of cancer reported>"}],"id":"5rrb9"}],"comments":{}}';
export const recommendationsBulletedList = '[{"type":"ul","children":[{"type":"li","children":[{"id":"1","type":"lic","children":[{"text":"No recommendation for referral to clinical genetics/familial cancer service based on the provided information and germline results."}],"listStyleType":"disc"}],"id":"hbwql"},{"type":"li","children":[{"id":"lye2l","type":"lic","listStyleType":"disc","children":[{"text":"Referral to a clinical genetics service is recommended for consultation/review and diagnostic genetic testing based on germline results."}],"listStart":2}],"id":"3xbjh"},{"type":"li","children":[{"id":"0uax7","type":"lic","listStyleType":"disc","listStart":3,"children":[{"text":"Referral to a familial cancer service is recommended for consultation/review and diagnostic genetic testing based on germline results."}]}],"id":"y4dzt"},{"type":"li","children":[{"id":"5pkzm","type":"lic","listStyleType":"disc","listStart":4,"children":[{"text":"Based on this result, the estimation of cancer risk could be influenced by family history of cancer. Referral to familial cancer service is recommended for consultation and review of pedigree."}]}],"id":"dh42s"},{"type":"li","children":[{"id":"06crz","type":"lic","listStyleType":"disc","listStart":5,"children":[{"text":"This result may have implications for family planning. Referral to a clinical genetics/familial cancer service is recommended for consultation/review based on germline results."}]}],"id":"s1pig"}],"id":"kvrhj"}]';
export const germlineNFClinicalInterp = '{"value":[{"children":[{"text":"This result does not completely exclude an underlying cancer genetic risk, given the following:"}],"type":"p","id":"BKfo48vx0m"},{"type":"p","id":"XDpNvKjtha","children":[{"text":""}]},{"type":"ul","children":[{"type":"li","children":[{"children":[{"text":"There is a small chance that the patient has a germline variant(s) associated with genetic cancer risk that cannot be found with current testing methods."}],"type":"lic","id":"DJJpT_olHC"}],"id":"-VZsGbURGh"},{"type":"li","children":[{"children":[{"text":"A germline variant of uncertain significance (VUS) may have been identified. However, only pathogenic and likely pathogenic germline variants in known cancer predisposition genes are routinely reported."}],"type":"lic","id":"NC8tlN1DDz"}],"id":"vtc7XDIN1x"},{"type":"li","children":[{"children":[{"text":"There may be other germline variants associated with genetic cancer risk that have not been discovered yet. These results are based on available literature at the time of the report being issued."}],"type":"lic","id":"me4dZwZFiV"}],"id":"vne0ugewdI"}],"id":"MGiaYDuCw6"}],"comments":{}}';
export const germlineNFClinicalInterpCat2Declined = '{"value":[{"children":[{"text":"No clinically reportable Category 1* germline variants identified.","bold":true}],"type":"p","id":"me4dZwZFiV"},{"type":"p","children":[{"text":""}],"id":"0ezuErQfkZ"},{"type":"p","children":[{"text":"NOTE: *Category 1 germline findings are described as a germline variant that:"}],"id":"0Vc4ebb6OT"},{"children":[{"children":[{"type":"lic","id":"B30cLPSFh_","children":[{"text":"Could make a difference to the patient\'s cancer diagnosis or treatment, "}]}],"type":"li","id":"q2C-M8DHdW"},{"children":[{"type":"lic","listStyleType":"disc","children":[{"text":"Are associated with risk of cancer during childhood and/or "}],"id":"HuafPIbkYw"}],"type":"li","id":"XUg0YoHAAu"},{"children":[{"type":"lic","listStyleType":"disc","children":[{"text":"There are evidence/expert-based guidelines available with surveillance recommendations during childhood (up to 18 years old). "}],"id":"EWtXD4R3vg"}],"type":"li","id":"L9rPCrUqMM"}],"type":"ul","id":"zu3aRK8dbM"},{"type":"p","children":[{"text":""}],"id":"x_7VfIkMKb"},{"type":"p","children":[{"text":"Category 2 germline results withheld","bold":true},{"text":" as consent was declined at the time the report was issued. "}],"id":"_Qhty6rbJX"},{"type":"p","children":[{"text":""}],"id":"MqbsmTHARQ"},{"children":[{"text":"Please refer to Return of Genetic Cancer Risk Results PISC form for further details.","italic":true}],"type":"p","id":"qhdSLRgN1n"}],"comments":{}}';
export const germlineNFClinicalInterpCat1Declined = '{"value":[{"children":[{"text":"Germline results withheld","bold":true},{"text":" as consent for the return of genetic cancer risk results was declined at the time the report was issued."}],"type":"p","id":"qhdSLRgN1n"},{"type":"p","children":[{"text":""}],"id":"XZBKqqlNU2"},{"children":[{"text":"Please refer to Return of Genetic Cancer Risk Results PISC form for further details.","italic":true}],"type":"p","id":"cHu_X-2HuB"}],"comments":{}}';
export const germlineFinalReportWillBeIssued = '{"value":[{"id":"1","type":"p","children":[{"text":"NOTE","bold":true},{"text":": A separate FINAL comprehensive germline report will be issued."}]}],"comments":{}}';
export const germlineFinalReportHasBeenIssued = '{"value":[{"children":[{"text":"NOTE","bold":true},{"text":": Please refer to the previously-issued ZERO2 Germline Findings Report for this patient."}],"id":"1","type":"p"}],"comments":{}}';
export const cat1CommentPrefix = '{"value":[{"children":[{"text":"Category 1 variant:","bold":true}],"type":"p","id":"lvVCvcLNUa"}],"comments":{}}';
export const cat2ConsentWithheld = '{"value":[{"children":[{"text":"Category 2 results withheld","bold":true},{"text":" as consent was declined at the time the report was issued."}],"type":"p","id":"lvVCvcLNUa"}],"comments":{}}';

// Comment types that appear on the germline report, including 'hidden' tags
export const germlineReportCommentTags: ICommentTagOption<GermlineCommentTypes>[] = [
  ...germlineCommentTags,
  {
    name: 'Clinical Notes',
    value: 'CLINICAL_NOTES',
    ...commentTagColours.green,
  },
  {
    name: 'Clinical Interpretation',
    value: 'CLINICAL_INTERPRETATIONS',
    ...commentTagColours.green,
  },
  {
    name: 'Recommendation',
    value: 'RECOMMENDATIONS',
    ...commentTagColours.green,
  },
];

// Comment types that appear on the molecular report, including 'hidden' tags
export const molecularReportTags: ICommentTagOption<MolecularCommentTypes>[] = [
  ...commonCommentTags,
  {
    name: 'Molecular Summary',
    value: 'MOLECULAR_SUMMARY',
    ...commentTagColours.green,
  },
  {
    name: 'HTS Summary',
    value: 'HTS_SUMMARY',
    ...commentTagColours.green,
  },
];
