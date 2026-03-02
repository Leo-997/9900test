import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.insert(
    knex.select({
      report_id: 'id',
      key: knex.raw('"molecular.hidePanel"'),
      value: knex.raw('CASE when hide_panel = 1 then "true" else "false" END'),
    })
      .from('zcc_reports'),
  )
    .into('zcc_reports_metadata')
    .then(() => (
      knex.schema.alterTable('zcc_reports', (table) => {
        table.dropColumn('hide_panel');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
