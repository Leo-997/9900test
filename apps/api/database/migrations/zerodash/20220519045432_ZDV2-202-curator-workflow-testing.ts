import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.enum('curation_status', [
      'New',
      'Preliminary Data Ready',
      'RNA Data Entry',
      'Ready for Curation',
      'Curation in Progress',
      'Ready Curation Meeting',
      'Curated',
      'Ready for MTB'
    ])
    .alter();
  })
  .then(async () => {
    return knex('zcc_sample').update({
      curation_status: 'New'
    })
    .where('curation_status', 'Preliminary Data Ready')
    .then(() => {
      return knex.schema.alterTable('zcc_sample', (table) => {
        table.enum('curation_status', [
          'New',
          'RNA Data Entry',
          'Ready for Curation',
          'Curation in Progress',
          'Ready Curation Meeting',
          'Curated',
          'Ready for MTB'
        ])
        .alter();
      });
    });
  });
}


export async function down(knex: Knex): Promise<void> {
}

