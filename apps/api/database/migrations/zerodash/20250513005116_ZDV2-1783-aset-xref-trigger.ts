import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(`
    DROP TRIGGER IF EXISTS zcc_piplines_AFTER_INSERT;
  `)
    .then(() => (
      knex.schema.raw(`
        CREATE TRIGGER zcc_piplines_AFTER_INSERT
        AFTER INSERT on zcc_pipelines FOR EACH ROW BEGIN
          IF (
            NEW.biosample_id IS NOT NULL
            AND (
              NEW.pipeline_name = 'mwonge/graphene-dev/graphene-hmftools'
              OR NEW.pipeline_name = 'mwonge/graphene-rna/carbonite'
            )
          )
          THEN
            UPDATE LOW_PRIORITY zcc_analysis_set
            SET curation_status = 'In Pipeline'
            WHERE (curation_status = 'Upcoming' or curation_status is NULL) and analysis_set_id in (
              select analysis_set_id from zcc_analysis_set_biosample_xref where biosample_id = NEW.biosample_id
            );
          END IF;
        END
      `)
    ));
}

export async function down(knex: Knex): Promise<void> {
}
