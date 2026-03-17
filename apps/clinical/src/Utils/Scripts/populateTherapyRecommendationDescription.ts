/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

interface ITherapyRec {
  id: string;
  chemotherapy: boolean;
  chemotherapyNote?: string;
  radiotherapy: boolean;
  radiotherapyNote?: string;
}

const clinicalKnex = knex(knexConnectionConfig);

function getDescription({
  chemotherapy,
  chemotherapyNote,
  radiotherapy,
  radiotherapyNote,
}: ITherapyRec): string {
  const children = [];
  if (chemotherapy && chemotherapyNote && chemotherapyNote.length > 0) {
    children.push({
      type: 'p',
      children: [{ text: `Chemotherapy: ${chemotherapyNote}` }],
    });
  }
  if (radiotherapy && radiotherapyNote && radiotherapyNote.length > 0) {
    children.push({
      type: 'p',
      children: [{ text: `Radiotherapy: ${radiotherapyNote}` }],
    });
  }
  return JSON.stringify(
    {
      value: [
        children.length > 0
          ? {
            type: 'prefill',
            children,
          }
          : {
            type: 'p',
            children: [{ text: '' }],
          },
      ],
      comments: {},
    },
  );
}

async function populateTherapyRecommendationDescription(): Promise<void> {
  console.log('running zcc_clinical_recommendation.description update script...');

  const therapyRecs = await clinicalKnex
    .select({
      id: 'r.id',
      chemotherapy: 't.chemotherapy',
      chemotherapyNote: 't.chemotherapy_note',
      radiotherapy: 't.radioTherapy',
      radiotherapyNote: 't.radiotherapy_note',
    })
    .from<ITherapyRec>({ r: 'zcc_clinical_recommendations' })
    .leftJoin(
      { t: 'zcc_clinical_therapies' },
      'r.therapy_id',
      't.id',
    )
    .whereNull('r.deleted_at')
    .andWhere('r.type', 'THERAPY')
    .andWhere(function custom() {
      this
        .whereNull('description')
        .orWhere('description', '');
    });

  try {
    const count = await Promise.all(
      therapyRecs.map((therapyRec) => clinicalKnex
        .update({ description: getDescription(therapyRec) })
        .where('id', therapyRec.id)
        .from('zcc_clinical_recommendations')),
    );

    console.log(`Successfully updated ${count.reduce((s, c) => s + c)} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_clinical_recommendation.description column:', error);
    process.exit(1);
  }
}

populateTherapyRecommendationDescription();
