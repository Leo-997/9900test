import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DROP TRIGGER IF EXISTS zcc_piplines_AFTER_INSERT;
  `);
  await knex.schema.raw(`
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
        UPDATE LOW_PRIORITY zcc_sample
        SET curation_status = 'In Pipeline'
        WHERE curation_status = 'Upcoming' and sample_id = NEW.biosample_id;
      END IF;
    END
  `);
}

export async function down(knex: Knex): Promise<void> {
}
