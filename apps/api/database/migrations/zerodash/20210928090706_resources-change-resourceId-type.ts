import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_evidences', (table) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    table.dropForeign('resource_id');
  });

  await knex.schema.alterTable('zcc_sample_resources', (table) => {
    table.string('resource_id').alter();
  });

  await knex.schema.alterTable('zcc_evidences', (table) => {
    table.string('resource_id').alter();
    table
      .foreign('resource_id')
      .references('resource_id')
      .inTable('zcc_sample_resources')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {}
