/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const germlineRecommendationOptions = {
  referralToFCSCounselling: 'Referral to a familial cancer service is recommended for genetic counselling',
  referralToCGSCounselling: 'Referral to a clinical genetics service is recommended for genetic counselling',
  clinicalConfirmRecommended: 'Clinical confirmation with diagnostic genetic testing is recommended',
  clinicalConfirmConsidered: 'Clinical confirmation with diagnostic genetic testing can be considered',
  cancerRiskImplication: 'Result may have implications for cancer risk in the patient and/or family members',
  eviQRiskManagement: 'eviQ risk management guidelines available',
  riskManagementTailored: 'Risk management tailored based on individualised assessment',
  familyPlanningImplication: 'Result may have implications for family planning',
};

const germlineRecOptions = [
  'referralToFCSCounselling',
  'referralToCGSCounselling',
  'clinicalConfirmRecommended',
  'clinicalConfirmConsidered',
  'cancerRiskImplication',
  'eviQRiskManagement',
  'riskManagementTailored',
  'familyPlanningImplication',
] as const;

export type GermlineRecOption = typeof germlineRecOptions[number];

const clinicalKnex = knex(knexConnectionConfig);

async function populateGermlineRecommendationDescription(): Promise<void> {
  console.log('running zcc_clinical_recommendation.description update script...');

  const recs = await clinicalKnex
    .select('id')
    .from('zcc_clinical_recommendations')
    .whereNull('deleted_at')
    .andWhere('type', 'GERMLINE')
    .andWhere(function custom() {
      this
        .whereNull('description')
        .orWhere('description', '');
    });

  try {
    const count = await Promise.all(
      recs.map(async (rec) => {
        const options = await clinicalKnex
          .select('option', 'order')
          .from('zccclinical.zcc_clinical_germline_recommendations')
          .where('id', rec.id)
          .orderBy('order', 'asc')
          .pluck('option');

        const description = JSON.stringify(
          {
            value: [
              options.length > 0
                ? {
                  type: 'prefill',
                  children: [{
                    children: options.map((option: GermlineRecOption) => ({
                      children: [{
                        type: 'lic',
                        children: [{
                          text: germlineRecommendationOptions[option],
                        }],
                      }],
                      type: 'li',
                    })),
                    type: 'ul',
                  }],
                } : {
                  type: 'p',
                  children: [{ text: '' }],
                },
            ],
            comments: {},
          },
        );

        return clinicalKnex
          .update({ description })
          .where('id', rec.id)
          .from('zcc_clinical_recommendations');
      }),
    );

    console.log(`Successfully updated ${count.reduce((s, c) => s + c)} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_clinical_recommendation.description column:', error);
    process.exit(1);
  }
}

populateGermlineRecommendationDescription();
