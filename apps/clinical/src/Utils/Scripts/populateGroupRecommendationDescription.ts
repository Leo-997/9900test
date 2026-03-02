/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

export interface IRecommendation{
  title: string;
  description: string;
}

const clinicalKnex = knex(knexConnectionConfig);

async function getChildRecommendations(parentRecId: string): Promise<IRecommendation[]> {
  return clinicalKnex
    .select({
      title: 'r.title',
      description: 'r.description',
    })
    .from({ x: 'zcc_clinical_discussion_recommendation_xref' })
    .join(
      { r: 'zcc_clinical_recommendations' },
      'x.child_recommendation_id',
      'r.id',
    )
    .where('x.parent_recommendation_id', parentRecId)
    .orderBy('x.order', 'asc');
}

function parseText(content: string): {value: any} {
  const parsedJSON = content === '' ? [] : JSON.parse(content);
  if (parsedJSON.value) {
    return parsedJSON;
  }
  return {
    value: parsedJSON,
  };
}

async function populateGroupRecommendationDescription(): Promise<void> {
  console.log('running zcc_clinical_recommendation.description update script...');

  const recs = await clinicalKnex
    .select('id')
    .from('zcc_clinical_recommendations')
    .whereNull('deleted_at')
    .andWhere('type', 'GROUP')
    .andWhere(function custom() {
      this
        .whereNull('description')
        .orWhere('description', '');
    });

  try {
    const count = await Promise.all(
      recs.map(async (rec) => {
        const children = await getChildRecommendations(rec.id);
        const description = JSON.stringify(
          {
            value: [
              children.length > 0
                ? {
                  type: 'prefill',
                  children: children.flatMap((child) => ([
                    {
                      type: 'p',
                      children: [
                        {
                          text: child.title,
                          bold: true,
                        },
                      ],
                    },
                    ...parseText(child.description).value,
                  ])),
                }
                : {
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

populateGroupRecommendationDescription();
