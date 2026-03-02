import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.raw(
    "DROP TRIGGER IF EXISTS zcc_sample_AFTER_INSERT_curation_workflow"
  ).then(async () => {
    await knex.schema.raw(`
      CREATE TRIGGER \`zcc_sample_AFTER_INSERT_curation_workflow\`
      AFTER INSERT ON \`zcc_sample\`
      FOR EACH ROW
      BEGIN
        IF NEW.curation_status IS NOT NULL THEN
          INSERT INTO zcc_sample_curation_workflow (
            sample_id,
            curation_status,
            step,
            created_by,
            created_at
          )
          VALUES (
            NEW.sample_id,
            NEW.curation_status, 
            0, 
            (CASE WHEN NEW.created_by IS NULL THEN \'sysadmin\' ELSE NEW.created_by END), 
            CURRENT_TIMESTAMP
          );
        END IF;
      END;
    `);
  });
}


export async function down(knex: Knex): Promise<void> {
}