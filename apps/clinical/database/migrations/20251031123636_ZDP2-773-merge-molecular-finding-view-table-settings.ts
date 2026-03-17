/* eslint-disable @typescript-eslint/naming-convention */
import type { Knex } from 'knex';

const snakeToCamelCase = (snakeCaseString: string): string => {
  switch (snakeCaseString) {
    case 'show_mutburden':
      return 'showMutBurden';
    case 'show_msi':
      return 'showMSI';
    case 'show_loh':
      return 'showLOH';
    case 'show_ipass':
      return 'showIPASS';
    default:
      return snakeCaseString.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
  }
};

type SettingsRow = {
  clinical_version_id: string;
  updated_at?: Date | string | null;
  updated_by?: string | null;
  [key: string]: unknown;
};

export async function up(knex: Knex): Promise<void> {
  const patientDiagnosisSettings = await knex<SettingsRow>('zcc_clinical_patient_diagnosis_settings');
  const nonGeneTableSettings = await knex<SettingsRow>('zcc_clinical_non_gene_mol_alterations_settings');
  const geneTableSettings = await knex<SettingsRow>('zcc_clinical_mol_alterations_settings');
  const tumourProfileSettings = await knex<SettingsRow>('zcc_clinical_tumour_profile_settings');

  await knex.schema.createTable('zcc_clinical_slide_table_settings', (table) => {
    table.uuid('clinical_version_id').primary();
    table.text('settings').notNullable();

    table.foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });

  const extractSettings = (row: SettingsRow | undefined): Record<string, boolean> => {
    if (!row) {
      return undefined;
    }

    const {
      clinical_version_id,
      updated_at,
      updated_by,
      ...settings
    } = row;

    return Object.entries(settings).reduce<Record<string, boolean | null>>((acc, [key, value]) => {
      acc[snakeToCamelCase(key)] = Boolean(value);
      return acc;
    }, {});
  };

  const mapByClinicalVersionId = (
    rows: SettingsRow[],
  ): Record<string, SettingsRow> => rows.reduce<Record<string, SettingsRow>>((acc, row) => {
    acc[row.clinical_version_id] = row;
    return acc;
  }, {});

  const patientMap = mapByClinicalVersionId(patientDiagnosisSettings);
  const nonGeneMap = mapByClinicalVersionId(nonGeneTableSettings);
  const geneMap = mapByClinicalVersionId(geneTableSettings);
  const tumourMap = mapByClinicalVersionId(tumourProfileSettings);

  const allClinicalVersionIds = Array.from(
    new Set([
      ...Object.keys(patientMap),
      ...Object.keys(nonGeneMap),
      ...Object.keys(geneMap),
      ...Object.keys(tumourMap),
    ]),
  );

  if (allClinicalVersionIds.length) {
    const slideSettings = allClinicalVersionIds.map((clinicalVersionId) => {
      const patient = patientMap[clinicalVersionId];
      const nonGene = nonGeneMap[clinicalVersionId];
      const gene = geneMap[clinicalVersionId];
      const tumour = tumourMap[clinicalVersionId];

      const payload: Record<string, unknown> = {};

      const patientSettings = extractSettings(patient);
      if (patientSettings && Object.keys(patientSettings).length) {
        payload.patientDiagnosisSettings = patientSettings;
      }

      const nonGeneSettings = extractSettings(nonGene);
      if (nonGeneSettings && Object.keys(nonGeneSettings).length) {
        payload.nonGeneMolAlterationSettings = nonGeneSettings;
      }

      const geneSettings = extractSettings(gene);
      if (geneSettings && Object.keys(geneSettings).length) {
        payload.molAlterationSettings = geneSettings;
      }

      const tumourSettings = extractSettings(tumour);
      const { showIPASS, ...tumourMolecularProfileSettings } = tumourSettings ?? {};

      if (tumourMolecularProfileSettings
        && Object.keys(tumourMolecularProfileSettings).length > 0) {
        payload.tumourMolecularProfileSettings = tumourMolecularProfileSettings;
      }

      if (showIPASS !== undefined) {
        payload.tumourImmuneProfileSettings = { showIPASS };
      }

      return {
        clinical_version_id: clinicalVersionId,
        settings: JSON.stringify(payload),
      };
    });

    await knex('zcc_clinical_slide_table_settings').insert(slideSettings);
  }

  await knex.schema.dropTable('zcc_clinical_patient_diagnosis_settings');
  await knex.schema.dropTable('zcc_clinical_non_gene_mol_alterations_settings');
  await knex.schema.dropTable('zcc_clinical_mol_alterations_settings');
  await knex.schema.dropTable('zcc_clinical_tumour_profile_settings');
}

export async function down(knex: Knex): Promise<void> {
}
