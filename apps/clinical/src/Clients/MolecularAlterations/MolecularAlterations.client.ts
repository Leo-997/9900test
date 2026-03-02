import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  ICreateMolecularAlterationsGroup,
  IMolAlterationSampleDetails,
  IMolecularAlterationDetail,
  IUpdateMolAlterationSummaryOrder,
  IUser,
  MolecularAlterationQueryDTO,
  UpdateMolecularAlterationBodyDTO,
} from 'Models';
import { MeetingType } from 'Models/Meetings/Meetings.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MolecularAlterationsClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private molAlterationsTable = 'zcc_clinical_mol_alterations';

  private molGroupTable = 'zcc_clinical_mol_alterations_group';

  private slideTable = 'zcc_clinical_slides';

  private clinicalVersionTable = 'zcc_clinical_versions';

  private meetingsTable = 'zcc_clinical_meetings';

  private meetingVersionXrefTable = 'zcc_clinical_meeting_version_xref';

  public async createMolecularAlterationsGroup(
    body: ICreateMolecularAlterationsGroup,
    user: IUser,
  ): Promise<string> {
    const id = uuid();
    await this.knex.insert(body.alterations.map((a) => ({
      group_id: id,
      mol_alteration_id: a,
      created_by: user.id,
    })))
      .into(this.molGroupTable);
    return id;
  }

  public async updateMolecularAlterationsGroup(
    groupId: string,
    body: ICreateMolecularAlterationsGroup,
    user: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db.insert(body.alterations.map((a) => ({
      group_id: groupId,
      mol_alteration_id: a,
      created_by: user.id,
    })))
      .into(this.molGroupTable)
      .onConflict()
      .ignore();

    await db.delete()
      .from(this.molGroupTable)
      .whereNotIn('mol_alteration_id', body.alterations)
      .andWhere('group_id', groupId);
  }

  public async deleteMolecularAlterationsGroup(
    id: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db.delete()
      .from(this.molGroupTable)
      .where('group_id', id);
  }

  public async getMolecularAlterations(
    clinicalVersionId: string,
    query: MolecularAlterationQueryDTO,
  ): Promise<IMolecularAlterationDetail[]> {
    const resp = await this.selectMolecularAlterationsBase(
      clinicalVersionId,
    )
      .modify(this.withFilters, query);
    return resp;
  }

  public async updateMolAlteration(
    clinicalVersionId: string,
    molAlterationId: string,
    {
      description,
      clinicalAlteration,
      clinicalReportable,
      clinicalTargetable,
      hidden,
      clinicalNotes,
      clinicalRnaExpression,
      frequency,
      prognosticFactor,
    }: UpdateMolecularAlterationBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        description,
        clinical_alteration: clinicalAlteration,
        clinical_reportable: clinicalReportable,
        clinical_targetable: clinicalTargetable,
        is_hidden: hidden,
        clinical_notes: clinicalNotes,
        updated_by: currentUser?.id,
        clinical_rna_expression: clinicalRnaExpression,
        frequency,
        prognostic_factor: prognosticFactor,
      })
      .from(this.molAlterationsTable)
      .where('id', molAlterationId)
      .where('clinical_version_id', clinicalVersionId);
  }

  public async updateMolAlterationSummaryOrder(
    clinicalVersionId: string,
    body: IUpdateMolAlterationSummaryOrder,
    currentUser: IUser,
  ): Promise<void> {
    return this.knex.transaction(async (trx) => {
      const promises: Knex.QueryBuilder[] = [];
      for (const order of body.order) {
        promises.push(
          trx.update({
            summary_order: order.order,
            updated_by: currentUser.id,
            updated_at: trx.fn.now(),
          })
            .from(this.molAlterationsTable)
            .where('id', order.id)
            .where('clinical_version_id', clinicalVersionId),
        );
      }
      await Promise.all(promises);
    });
  }

  public async getMolAlterationById(
    clinicalVersionId: string,
    molAlterationId: string,
  ): Promise<IMolecularAlterationDetail> {
    const data = this.selectMolecularAlterationsBase(
      clinicalVersionId,
    )
      .where('alt.id', molAlterationId)
      .first();

    return data;
  }

  private withFilters(
    query: Knex.QueryBuilder,
    filters: MolecularAlterationQueryDTO,
  ): void {
    query
      .andWhere(function customFilters() {
        if (filters.ids?.length) {
          this.whereIn('alt.id', filters.ids);
        }

        if (filters.molAlterationGroupId) {
          this.where('group.group_id', filters.molAlterationGroupId);
        }

        if (filters.geneIds) {
          this.whereIn('alt.gene_id', filters.geneIds)
            .orWhereIn('alt.secondary_gene_id', filters.geneIds);
        }

        if (filters.geneMutations?.length) {
          this.where(function geneMutations() {
            for (const mutation of filters.geneMutations) {
              const [type, gene] = mutation.split(':');
              this.orWhere('alt.mutation_type', type)
                .andWhere(function searchGene() {
                  this.where('alt.gene', gene)
                    .orWhere('alt.secondary_gene', gene);
                });
            }
          });
        }

        if (filters.mutationIds?.length) {
          this.whereIn('alt.mutation_id', filters.mutationIds);
        }

        if (filters.excludeMutations) {
          this.whereNotIn('alt.mutation_id', filters.excludeMutations);
        }
      });
  }

  public async getMolAlterationDetails(
    clinicalVersionId: string,
    groupId: string,
    molAlterationId: string,
  ): Promise<IMolAlterationSampleDetails> {
    return this.knex({ group: this.molGroupTable })
      .select({
        patientId: 'version.patient_id',
        analysisSetId: 'version.analysis_set_id',
        zero2Category: 'version.zero2_category',
        zero2Subcat1: 'version.zero2_subcategory1',
        zero2Subcat2: 'version.zero2_subcategory1',
        zero2FinalDiagnosis: 'version.zero2_final_diagnosis',
        mtbMeeting: 'meeting.date',
        mutationType: 'alteration.mutation_type',
        gene: 'alteration.gene',
        geneId: 'alteration.gene_id',
        secondaryGene: 'alteration.secondary_gene',
        secondaryGeneId: 'alteration.secondary_gene_id',
        // TODO: need to add correct column
        // mtbReport:"",
        pathway: 'alteration.pathway',
        additionalData: 'alteration.additional_data',
        curationTargetable: 'alteration.curation_targetable',
        clinicalTargetable: 'alteration.clinical_targetable',
        curationComment: 'alteration.curation_comment',
        reportComment: 'slide.report_note',
      })
      .innerJoin(
        { alteration: this.molAlterationsTable },
        'alteration.id',
        'group.mol_alteration_id',
      )
      .innerJoin(
        { version: this.clinicalVersionTable },
        'version.id',
        'alteration.clinical_version_id',
      )
      .innerJoin(
        { slide: this.slideTable },
        'slide.mol_alteration_group_id',
        'group.group_id',
      )
      .where('group.group_id', groupId)
      .where('group.mol_alteration_id', molAlterationId)
      .where('version.id', clinicalVersionId)
      .modify(
        this.withMeeting,
        this.knex,
        this.meetingsTable,
        this.meetingVersionXrefTable,
      )
      .first();
  }

  private selectMolecularAlterationsBase(
    clinicalVersionId: string,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        id: 'alt.id',
        mutationId: 'alt.mutation_id',
        mutationType: 'alt.mutation_type',
        gene: 'alt.gene',
        geneId: 'alt.gene_id',
        secondaryGene: 'alt.secondary_gene',
        secondaryGeneId: 'alt.secondary_gene_id',
        pathway: 'alt.pathway',
        pathwayId: 'alt.pathway_id',
        alteration: 'alt.alteration',
        curationClassification: 'alt.curation_classification',
        curationTargetable: 'alt.curation_targetable',
        clinicalReportable: 'alt.clinical_reportable',
        clinicalTargetable: 'alt.clinical_targetable',
        hidden: 'alt.is_hidden',
        frequency: 'alt.frequency',
        prognosticFactor: 'alt.prognostic_factor',
        clinicalVersionId: 'alt.clinical_version_id',
        clinicalNotes: 'alt.clinical_notes',
        additionalData: 'alt.additional_data',
        clinicalAlteration: 'alt.clinical_alteration',
        clinicalRnaExpression: 'alt.clinical_rna_expression',
        summaryOrder: 'alt.summary_order',
        description: 'alt.description',
        createdAt: 'alt.created_at',
        updatedAt: 'alt.updated_at',
      })
      .from({ alt: this.molAlterationsTable })
      .leftJoin(
        { group: 'zcc_clinical_mol_alterations_group' },
        'alt.id',
        'group.mol_alteration_id',
      )
      .innerJoin(
        { version: 'zcc_clinical_versions' },
        'alt.clinical_version_id',
        'version.id',
      )
      .where(
        'version.id',
        clinicalVersionId,
      )
      .groupBy('alt.id');
  }

  // As this will be used as a callback function
  // Any references to 'this' will be undefined
  // Knex, and the table names will need to be passed in.
  private withMeeting(
    query: Knex.QueryBuilder,
    knex: Knex,
    meetingsTable: string,
    meetingVersionXrefTable: string,
    type: MeetingType = 'MTB',
  ): Knex.QueryBuilder {
    return query.leftJoin(
      knex
        .select({
          date: 'xref.date',
          version: 'xref.clinical_version_id',
        })
        .from({ meeting: meetingsTable })
        .innerJoin({ xref: meetingVersionXrefTable }, 'meeting.id', 'xref.meeting_id')
        .where('xref.type', type)
        .as('meeting'),
      'meeting.version',
      'version.id',
    );
  }
}
