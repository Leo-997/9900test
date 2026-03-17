/*
* This script deduplicates rows on table zcc_curated_sample_somatic_armcnv
* Duplicate rows will share 'biosample_id', 'chr' and 'arm'
* Preserve row with 'classification', delete the rest.
* If +1 row has classification or none has, keep them as 'ambiguous'
*/

/* eslint-disable no-console */
import { knex } from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);
const TABLE = 'zcc_curated_sample_somatic_armcnv';

async function deduplicateArmCnv(): Promise<void> {
  console.log('Starting duplicate cleanup…');

  try {
    // Delete duplicates
    const deletedCount = await zdKnex(TABLE)
      .join(
        zdKnex(TABLE)
          .select('biosample_id', 'chr', 'arm')
          .groupBy('biosample_id', 'chr', 'arm')
          .havingRaw('COUNT(*) > 1')
          .havingRaw(`
            SUM(CASE WHEN classification IS NOT NULL AND classification <> '' THEN 1 ELSE 0 END) = 1
          `)
          .as('d'),
        function () {
          this.on('d.biosample_id', '=', `${TABLE}.biosample_id`)
            .andOn('d.chr', '=', `${TABLE}.chr`)
            .andOn('d.arm', '=', `${TABLE}.arm`);
        },
      )
      .where((b) => b.whereNull(`${TABLE}.classification`).orWhere(`${TABLE}.classification`, ''))
      .del();

    // Find ambiguous duplicates
    const ambiguous = await zdKnex(TABLE)
      .select('biosample_id', 'chr', 'arm')
      .groupBy('biosample_id', 'chr', 'arm')
      .havingRaw('COUNT(*) > 1')
      .havingRaw(`
      SUM(CASE WHEN classification IS NOT NULL AND classification <> '' THEN 1 ELSE 0 END) <> 1
    `);

    console.log(`Deleted ${deletedCount} duplicate row(s).`);
    if (ambiguous.length) {
      console.log('Ambiguous duplicate groups:');
      for (const row of ambiguous) console.log(`- biosample_id=${row.biosample_id}, chr=${row.chr}, arm=${row.arm}`);
    } else {
      console.log('No ambiguous duplicate groups found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during duplicate cleanup:', err);
  } finally {
    await zdKnex.destroy();
  }
}

deduplicateArmCnv();
