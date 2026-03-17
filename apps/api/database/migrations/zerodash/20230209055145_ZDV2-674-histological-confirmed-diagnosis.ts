import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_analysis_set', (table) => {
      table
        .string('histologic_diagnosis', 50)
        .nullable()
        .defaultTo(null)
        .after('diagnosis');
      table
        .boolean('confirmed_diagnosis')
        .nullable()
        .defaultTo(null)
        .after('final_diagnosis');
    })
    .then(() => {
      return knex.schema.alterTable('zcc_sample', (table) => {
        table
          .string('histologic_diagnosis', 50)
          .nullable()
          .defaultTo(null)
          .after('diagnosis');
        table
          .boolean('confirmed_diagnosis')
          .nullable()
          .defaultTo(null)
          .after('final_diagnosis');
      });
    });
}

export async function down(knex: Knex): Promise<void> {}
