import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.date('curation_finalised_at').nullable().after('curation_status');
  });

  // Add trigger to update time of curation finalisation automatically
  await knex.raw(`
    CREATE TRIGGER update_curation_finalised_at
    AFTER UPDATE ON zcc_analysis_set
    FOR EACH ROW
    BEGIN
        IF NEW.curation_stage = 'Done' AND OLD.curation_stage != 'Done' THEN
            UPDATE zcc_analysis_set
            SET curation_finalised_at = CURRENT_TIMESTAMP
            WHERE analysis_set_id = NEW.analysis_set_id;
        END IF;
    END;
  `);
}

export async function down(knex: Knex): Promise<void> {
}
