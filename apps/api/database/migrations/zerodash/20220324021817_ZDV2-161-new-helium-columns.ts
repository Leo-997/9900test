import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  const tables = [
    "zcc_curated_sample_somatic_snv",
    "zcc_curated_sample_somatic_cnv",
    "zcc_curated_sample_somatic_sv",
    "zcc_curated_sample_germline_snv",
    "zcc_curated_sample_germline_cnv"
  ];

  const columns = [
    "helium_score", 
    "helium_comment", 
    "helium_updated"
  ];

  const trigger_name = (table: string, event: "UPDATE" | "INSERT") => `${table}_BEFORE_HELIUM_${event}`;
  const trigger = (table: string, event: "UPDATE" | "INSERT") => {
    const condition = 
      event === "UPDATE"
        ? 'NEW.helium_score <> OLD.helium_score OR (NEW.helium_score is NOT NULL AND OLD.helium_score is NULL)'
        : 'NEW.helium_score IS NOT NULL';

    return `CREATE TRIGGER \`${trigger_name(table, event)}\`
    BEFORE ${event} ON \`${table}\`
    FOR EACH ROW
    BEGIN
      IF ${condition} THEN
        SET NEW.helium_updated = CURRENT_TIMESTAMP;
      END IF;
    END`;
  }

  const runSequence = (functions: Knex.SchemaBuilder[]) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  const statementsToRun = [];
  tables.map((table: string) => {
    statementsToRun.push(
      knex.schema.alterTable(table, (tbl) => {
        tbl.double('helium_score');
        tbl.string('helium_comment', 500);
        tbl.timestamp('helium_updated');
      })
    );
    ["UPDATE", "INSERT"].map((event: "UPDATE" | "INSERT") => {
      statementsToRun.push(
        knex.schema.raw(
          `DROP TRIGGER IF EXISTS ${trigger_name(table, event)}`,
        ),
        knex.schema.raw(
          trigger(table, event),
        )
      )
    })
  });

  return runSequence(statementsToRun).catch(async (error) => {
    const promises = [];
    tables.map((table) => {
      columns.map((column) => {
        promises.push(
          knex.schema.hasColumn(table, column).then((exists) => {
            if (exists) {
              knex.schema.table(table, (t) => t.dropColumn(column));
            }
          })
        )
      });
      promises.push(
        knex.schema.raw(
          `DROP TRIGGER IF EXISTS ${trigger_name(table, "UPDATE")}`,
        ),
        knex.schema.raw(
          `DROP TRIGGER IF EXISTS ${trigger_name(table, "INSERT")}`,
        )
      )
    });
    
    await Promise.all(promises);
    throw Error(error);
  });
}


export async function down(knex: Knex): Promise<void> {
}
