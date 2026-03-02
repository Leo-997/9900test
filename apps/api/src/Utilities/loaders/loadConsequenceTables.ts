import knex from 'knex';
import {
  knexConnectionConfig as zdConfig,
} from '../../../knexfile';
import { impactGroups } from '../../Constants/consequences';

const zdKnex = knex(zdConfig);

async function loadConsequences() {
  for (const impact in impactGroups) {
    console.log(`Loading ${impact} consequences`);
    for (const consequence of impactGroups[impact]) {
      const existing = await zdKnex('zcc_consequence').where({ consequence });
      if (existing.length === 0) {
        await zdKnex('zcc_consequence').insert({
          consequence,
          impact,
        });
      }
    }
  }

  const pageSize = 1000;
  const snvsCount = await zdKnex('zcc_curated_snv').count('* as count').first();
  const pages = Math.ceil(snvsCount.count as number / pageSize);
  for (let page = 1; page <= pages; page++) {
    console.log(`Loading snvs page ${page} of ${pages}. Total: ${snvsCount.count}. Page size: ${pageSize}`);
    const snvs = await zdKnex('zcc_curated_snv').select({
      variantId: 'variant_id',
      consequence: 'consequence',
    })
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const rows = [];
    for (const snv of snvs) {
      const cons = snv.consequence.split('&');
      for (const con of cons) {
        rows.push({
          consequence: con,
          variant_id: snv.variantId,
        });
      }
    }

    await zdKnex('zcc_consequence_variant')
      .insert(rows)
      .onConflict(
        ['consequence', 'variant_id'],
      )
      .ignore();
  }

  process.exit(0);
}

loadConsequences();
