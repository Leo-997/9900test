import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_qc_metrics_warning_acknowledgement',
    function addIndividualNoteForContamination(table) {
      table.string('contamination_note', 255).defaultTo(null);
      table.string('note', 255)
        .nullable()
        .defaultTo(null)
        .alter();
      table.renameColumn('note', 'status_note');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

