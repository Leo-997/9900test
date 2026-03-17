import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
    GeneListSortCols,
    ICreateGeneListBody, IGene, IGeneList,
    IGetGeneListFilters,
    IGetPanelReportableNotesQuery,
    IPanelReportableNote,
    IUpdateGeneNote,
    IUpdatePanelReprotableNote,
} from 'Models/GeneLists/GeneLists.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withPagination } from 'Utils/Query/pagination.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GeneListsClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  private readonly geneListTable = 'zcc_gene_list';

  private readonly geneListVersionTable = 'zcc_gene_list_version';

  private readonly geneListVersionGeneXrefTable = 'zcc_gene_list_version_gene_xref';

  private readonly reportableNotesTable = 'zcc_panel_reportable_notes';

  private readonly geneNoteTable = 'zcc_gene_note';

  public async getGeneLists(filters: IGetGeneListFilters): Promise<IGeneList[]> {
    const query = this.getGeneListsBase()
      .modify(this.withFilters, filters, this);

    if (filters.page !== undefined && filters.limit !== undefined) {
      query
        .modify(withPagination, filters.page, filters.limit);
    }

    return query;
  }

  public async getGeneListById(id: string): Promise<IGeneList> {
    return this.getGeneListsBase()
      .modify(this.withFilters, {}, this)
      .where('list.id', id)
      .first();
  }

  public async getGenes(versionId: string): Promise<IGene[]> {
    const genePanel = await this.knex
      .select('gene_panel')
      .from(this.geneListVersionTable)
      .where('id', versionId)
      .first();

    const geneIds = await this.knex
      .select('gene_id')
      .from(this.geneListVersionGeneXrefTable)
      .where({ gene_list_version_id: versionId })
      .pluck('gene_id');

    if (geneIds.length === 0) {
      return [];
    }

    // get ids of genes in both somatic and ACTIVE germline list of this panel
    let somaticGermlineIds = new Set();
    if (genePanel.gene_panel) {
      const { geneListVersionTable } = this;
      const { geneListTable } = this;
      const { geneListVersionGeneXrefTable } = this;
      const isSomaticGermline = await this.knex
        .from({ somaticVersion: geneListVersionTable })
        .join({ somaticList: geneListTable }, 'somaticVersion.gene_list_id', 'somaticList.id')
        .join({ somaticXref: geneListVersionGeneXrefTable }, 'somaticVersion.id', 'somaticXref.gene_list_version_id')
        .where('somaticList.type', 'somatic')
        .whereIn('somaticXref.gene_id', geneIds)
        .whereExists(function inGermlinePanel() {
          this.select()
            .from({ germlineVersion: geneListVersionTable })
            .join({ germlineList: geneListTable }, 'germlineVersion.gene_list_id', 'germlineList.id')
            .join(
              { germlineXref: geneListVersionGeneXrefTable },
              'germlineVersion.id',
              'germlineXref.gene_list_version_id',
            )
            .where('germlineVersion.is_active', 1)
            .andWhere('germlineList.type', 'germline')
            .andWhere('germlineVersion.gene_panel', genePanel.gene_panel)
            .andWhereRaw('germlineXref.gene_id = somaticXref.gene_id');
        });
      somaticGermlineIds = new Set(isSomaticGermline.map((x) => x.gene_id));
    }

    // get genes and list of other panels each gene belongs to
    const genes = await this.knex
      .from({ xref: 'zcc_gene_list_version_gene_xref' })
      .innerJoin({ version: 'zcc_gene_list_version' }, 'xref.gene_list_version_id', 'version.id')
      .innerJoin({ list: 'zcc_gene_list' }, 'list.id', 'version.gene_list_id')
      .leftJoin({ note: 'zcc_gene_note' }, 'xref.gene_id', 'note.gene_id')
      .whereIn('xref.gene_id', geneIds)
      .select({
        geneId: 'xref.gene_id',
        panel: 'version.gene_panel',
        codeAbbreviation: 'list.code_abbreviation',
        note: 'note.note',
      });

    const geneMap = new Map<
      number,
      {
        geneId: number;
        panels: Map<string, string>;
        isSomaticGermline: boolean;
        note: string;
      }
    >();

    for (const gene of genes) {
      const {
        geneId,
        panel,
        codeAbbreviation,
        note,
      } = gene;

      if (!geneMap.has(geneId)) {
        geneMap.set(geneId, {
          geneId,
          panels: new Map(),
          isSomaticGermline: somaticGermlineIds.has(geneId),
          note: note || '',
        });
      }

      if (panel && panel !== genePanel && panel !== 'No panel') {
        geneMap.get(geneId)?.panels.set(panel, codeAbbreviation || '');
      }
    }
    return Array.from(geneMap.values()).map(({ panels, ...data }) => ({
      ...data,
      panels: Array.from(panels.entries()).map(([panel, code]) => ({
        panel,
        code,
      })),
    }));
  }

  public async createGeneList(geneList: ICreateGeneListBody): Promise<IGeneList> {
    await this.knex.transaction(async (trx) => {
      const listId = uuid();
      await trx.insert({
        id: listId,
        name: geneList.name,
        type: geneList.type,
        is_high_risk: geneList.isHighRisk,
      })
        .into(this.geneListTable)
        .onConflict('name')
        .ignore();

      const versionId = uuid();

      if (geneList.deactivateOldVersions) {
        await trx
          .update({ is_active: false })
          .from(this.geneListVersionTable)
          .where('gene_list_id', trx.select('id').from(this.geneListTable).where('name', geneList.name));
      }

      await trx.insert({
        id: versionId,
        gene_list_id: trx.select('id').from(this.geneListTable).where('name', geneList.name),
        version: geneList.version,
        gene_panel: geneList.genePanel,
        is_active: true,
      })
        .into(this.geneListVersionTable)
        .onConflict(['gene_list_id', 'version'])
        .ignore();

      const geneListId = trx
        .select('id')
        .from(this.geneListTable)
        .where('name', geneList.name);

      const geneListVersionId = trx
        .select('id')
        .from(this.geneListVersionTable)
        .where('version', geneList.version)
        .andWhere('gene_list_id', geneListId);

      if (geneList.geneIds?.length) {
        await trx
          .insert(geneList.geneIds.map((geneId) => ({
            gene_id: geneId,
            gene_list_version_id: geneListVersionId,
          })))
          .into(this.geneListVersionGeneXrefTable)
          .onConflict(['gene_id', 'gene_list_version_id'])
          .ignore();
      }
    });

    return this.getGeneLists({
      name: geneList.name,
      version: geneList.version,
      genePanel: geneList.genePanel,
      type: geneList.type,
      isHighRisk: geneList.isHighRisk,
    }).then((geneLists) => geneLists[0]);
  }

  private getGeneListsBase(): Knex.QueryBuilder {
    const countsQuery = this.knex
      .select('gene_list_version_id')
      .from({ xref: 'zcc_gene_list_version_gene_xref' })
      .countDistinct({ count: 'xref.gene_id' })
      .groupBy('gene_list_version_id')
      .as('stats');

    return this.knex
      .select({
        id: 'list.id',
        versionId: 'version.id',
        name: 'list.name',
        version: 'version.version',
        genePanel: 'version.gene_panel',
        type: 'list.type',
        isHighRisk: 'list.is_high_risk',
        isActive: 'version.is_active',
        titleAbbreviation: 'list.title_abbreviation',
        codeAbbreviation: 'list.code_abbreviation',
        archiveNotes: 'version.archive_notes',
        geneCount: 'stats.count',
        updatedAt: 'updated_at',
        updatedBy: 'updated_by',
        createdAt: 'created_at',
        createdBy: 'created_by',
      })
      .from({ list: this.geneListTable })
      .innerJoin({ version: this.geneListVersionTable }, 'list.id', 'version.gene_list_id')
      .leftJoin(countsQuery, 'stats.gene_list_version_id', 'version.id');
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: IGetGeneListFilters,
    client: GeneListsClient,
  ): void {
    const sortMap: Record<GeneListSortCols, string | { columnName: string }> = {
      name: { columnName: 'list.name' },
      version: 'INET_ATON(SUBSTRING_INDEX(CONCAT(version,".0.0.0"),".",4)) ?',
      genePanel: { columnName: 'version.gene_panel' },
    };

    if (filters.geneId) {
      qb.innerJoin({ xref: client.geneListVersionGeneXrefTable }, 'xref.gene_list_version_id', 'version.id');
    }
    qb.where(function addFilters() {
      if (filters.search) {
        this.where('list.name', 'like', `%${filters.search}%`)
          .orWhere('version.version', 'like', `%${filters.search}%`);
      }

      if (filters.name) {
        this.andWhere('list.name', filters.name);
      }

      if (filters.version) {
        this.andWhere('version.version', filters.version);
      }

      if (filters.genePanel) {
        this.andWhere('version.gene_panel', filters.genePanel);
      }

      if (filters.type) {
        this.andWhere('list.type', filters.type);
      }

      if (filters.isHighRisk !== undefined) {
        this.andWhere('list.is_high_risk', filters.isHighRisk);
      }

      if (filters.isActive !== 'all') {
        if (filters.isActive !== undefined) {
          this.andWhere('version.is_active', filters.isActive);
        } else {
          this.andWhere('version.is_active', true);
        }
      }

      if (filters.geneId) {
        this.andWhere('xref.gene_id', filters.geneId);
      }
    });
    for (const order of filters.orderBy || []) {
      const [col, dir] = order.split(':');
      const result = sortMap[col];
      if (result) {
        if (typeof result === 'string') {
          qb.orderByRaw(result.replace('?', dir));
        } else {
          qb.orderBy(result.columnName, dir || 'asc');
        }
      }
    }
    qb.orderByRaw('INET_ATON(SUBSTRING_INDEX(CONCAT(version,".0.0.0"),".",4)) desc');
  }

  public getReportableNotes(
    filters: IGetPanelReportableNotesQuery,
  ): Knex.QueryBuilder {
    return this.knex.select({
      id: 'id',
      genePanel: 'gene_panel',
      type: 'type',
      content: 'content',
    })
      .from(this.reportableNotesTable)
      .where({
        gene_panel: filters.genePanel,
        type: filters.type,
      });
  }

  public async updateReportableNote(
    body: IUpdatePanelReprotableNote,
  ): Promise<IPanelReportableNote> {
    await this.knex.insert({
      gene_panel: body.genePanel,
      type: body.type,
      content: body.content,
    })
      .into(this.reportableNotesTable)
      .onConflict()
      .merge(['content']);

    return this.getReportableNotes(body)
      .first();
  }

  public async updateGeneNote(
    body: IUpdateGeneNote,
  ): Promise<void> {
    await this.knex.insert({
      gene_id: body.geneId,
      note: body.note,
    })
      .into(this.geneNoteTable)
      .onConflict(['gene_id'])
      .merge(['note']);
  }
}
