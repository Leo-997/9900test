/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import knex from 'knex';
import { ICitation } from 'Models/Citation/Citation.model';
import { IEvidence } from 'Models/Evidence/Evidence.model';
import { knexConnectionConfig } from '../../../knexfile';



const citationsTable = 'zcc_citations';
const evidenceTable = 'zcc_evidences';
const apiEvidenceTable = 'zcczerodashhg38.zcc_evidences';
const clinicalEvidenceTable = 'zccclinical.zcc_clinical_evidence';
const zdKnex = knex(knexConnectionConfig);

async function deduplicateCitations(): Promise<void> {
  const citationsByPMID: Record<string, ICitation[]> = {};

  const citations = await zdKnex
    .select('*')
    .from(citationsTable)
    .orderBy('createdAt', 'desc')
    .whereNull('deletedAt');

  for (const citation of citations) {
    if (citation.source === 'PUBMED') {
      if (!citationsByPMID[citation.externalId]) {
        citationsByPMID[citation.externalId] = [citation];
      } else {
        citationsByPMID[citation.externalId].push(citation);
      }
    }
  }

  for (const [, matchingCitations] of Object.entries(citationsByPMID)) {
    const [representative, ...rest] = matchingCitations;

    if (rest.length) {
      console.log(`Replacing the following citations with ${JSON.stringify(representative)}: ${JSON.stringify(rest)}`);
      // update all evidence that the rest are a part of the use the representative
      const updateQuery = zdKnex.update({
        citationId: representative.id,
      })
        .whereIn('citationId', rest.map((c) => c.id))
        .from(evidenceTable);

      console.log(`Update query: ${updateQuery.toString()}`);

      await updateQuery;

      // delete duplicate citations
      const deleteQuery = zdKnex.update({
        deletedAt: zdKnex.fn.now(),
        deletedBy: 'sysadmin',
      })
        .whereIn('id', rest.map((c) => c.id))
        .from(citationsTable);

      console.log(`Delete query: ${deleteQuery.toString()}`);

      await deleteQuery;
    }
  }
}

async function deduplicateEvidence(): Promise<void> {
  const evidenceByCitationId: Record<string, IEvidence[]> = {};

  const evidence = await zdKnex
    .select('*')
    .from(evidenceTable)
    .orderBy('createdAt', 'desc')
    .whereNull('deletedAt');

  for (const ev of evidence) {
    if (ev.citationId) {
      if (!evidenceByCitationId[ev.citationId]) {
        evidenceByCitationId[ev.citationId] = [ev];
      } else {
        evidenceByCitationId[ev.citationId].push(ev);
      }
    }
  }

  for (const [, matchingEvidence] of Object.entries(evidenceByCitationId)) {
    const [representative, ...rest] = matchingEvidence;

    if (rest.length) {
      console.log(`Replacing the following evidences with ${JSON.stringify(representative)}: ${JSON.stringify(rest)}`);

      const apiEvidenceForRep = await zdKnex
        .select({
          link: zdKnex.raw('concat(sample_id, entity_type, entity_id)'),
        })
        .from(apiEvidenceTable)
        .where('external_id', representative.id);

      const filteredAPIEvidenceForRep = apiEvidenceForRep.map((e) => e.link).filter((e) => e);

      // update all evidence that the rest are a part of the use the representative
      const apiUpdateQuery = zdKnex.update({
        external_id: representative.id,
      })
        .whereIn('external_id', rest.map((c) => c.id))
        .where(function rawQuery() {
          if (filteredAPIEvidenceForRep.length) {
            this.whereRaw(
              `concat(sample_id, entity_type, entity_id) not in (${
                new Array(filteredAPIEvidenceForRep.length)
                  .fill('?')
                  .join(', ')
              })`,
              filteredAPIEvidenceForRep,
            );
          }
        })
        .from(apiEvidenceTable);

      console.log(`API Update query: ${apiUpdateQuery.toString()}`);

      await apiUpdateQuery;

      const apiDeleteQuery = zdKnex.delete()
        .from(apiEvidenceTable)
        .whereIn('external_id', rest.map((c) => c.id));

      console.log(`API Delete query: ${apiDeleteQuery.toString()}`);

      await apiDeleteQuery;

      const clinicalEvidenceForRep = await zdKnex
        .select({
          link: zdKnex.raw('concat(clinical_version_id, entity_type, entity_id)'),
        })
        .from(clinicalEvidenceTable)
        .where('external_id', representative.id);

      const filteredClinicalEvidenceForRep = clinicalEvidenceForRep
        .map((e) => e.link)
        .filter((e) => e);

      const clinicalUpdateQuery = zdKnex.update({
        external_id: representative.id,
      })
        .whereIn('external_id', rest.map((c) => c.id))
        .where(function rawQuery() {
          if (filteredClinicalEvidenceForRep.length) {
            this.whereRaw(
              `concat(clinical_version_id, entity_type, entity_id) not in (${
                new Array(filteredClinicalEvidenceForRep.length)
                  .fill('?')
                  .join(', ')
              })`,
              filteredClinicalEvidenceForRep,
            );
          }
        })
        .from(clinicalEvidenceTable);

      console.log(`Clinical Update query: ${clinicalUpdateQuery.toString()}`);

      await clinicalUpdateQuery;

      const clinicalDeleteQuery = zdKnex.delete()
        .from(clinicalEvidenceTable)
        .whereIn('external_id', rest.map((c) => c.id));

      console.log(`Clinical Delete query: ${clinicalDeleteQuery.toString()}`);

      await clinicalDeleteQuery;

      // delete duplicate evidence
      const deleteQuery = zdKnex.update({
        deletedAt: zdKnex.fn.now(),
        deletedBy: 'sysadmin',
      })
        .whereIn('id', rest.map((e) => e.id))
        .from(evidenceTable);

      console.log(`Delete query: ${deleteQuery.toString()}`);

      await deleteQuery;
    }
  }
}

async function deuplicate(): Promise<void> {
  await deduplicateCitations();
  await deduplicateEvidence();

  process.exit(0);
}

deuplicate();
