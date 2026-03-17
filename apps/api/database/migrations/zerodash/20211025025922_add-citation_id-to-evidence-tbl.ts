import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex
    .raw(`ALTER TABLE zcc_citation CHARACTER SET utf8 COLLATE utf8_general_ci;`)
    .then(() =>
      knex.raw(
        `ALTER TABLE zcc_citation CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`,
      ),
    )
    .then(() =>
      knex.schema.alterTable('zcc_evidences', (tbl) => {
        tbl.string('citation_id').after('resource_id');

        tbl
          .foreign('citation_id')
          .references('id')
          .inTable('zcc_citation')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');
      }),
    );
}

export async function down(knex: Knex): Promise<void> {}
