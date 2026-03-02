import { Dispatch, SetStateAction, useState } from 'react';
import { ICommentTagOption } from '@/types/Comments/CommonComments.types';
import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import { ICurationCommentsQuery } from '../../../../types/Comments/CurationComments.types';
import { FilterOption } from '../../../../types/Search.types';
import CustomGeneList from '../../../GeneFilter/CustomGeneList';
import ListMenu from '../../../SearchFilterBar/ListMenu';
import { curationCommentTabs, curationThreadEntityOptions } from '../../../../constants/Curation/comments';

interface IProps {
  filters: ICurationCommentsQuery;
  setFilters: Dispatch<SetStateAction<ICurationCommentsQuery>>;
  tagOptions: ICommentTagOption<string>[];
}

export default function CommentsFilterOptions({
  filters,
  setFilters,
  tagOptions,
}: IProps): FilterOption[] {
  const [anchorElThreadType, setAnchorElThreadType] = useState<null | HTMLElement>(null);
  const [anchorElEntityType, setAnchorElEntityType] = useState<null | HTMLElement>(null);
  const [anchorElCommentType, setAnchorElCommentType] = useState<null | HTMLElement>(null);
  const [anchorElGeneList, setAnchorElGeneList] = useState<null | HTMLElement>(null);

  const getChipLabel = (list: string[], length = 4): string => (
    list.length > length ? (
      `${list
        ?.slice(0, length)
        .map((g) => g.replace(/_/g, ' ').toUpperCase())
        .join('; ')} + ${
        list.length - length
      } more`
    ) : (
      list
        ?.map((g) => g.replace(/_/g, ' ').toUpperCase())
        .join('; ')
    )
  );

  return [
    {
      label: 'Show hidden comments',
      value: 'isHiddenInArchive',
      type: 'item',
      check: Boolean(filters.isHiddenInArchive),
    },
    {
      label: 'Comment type',
      value: 'threadType',
      type: 'menu',
      defaultVal: [],
      check: Boolean(filters.threadType && filters.threadType.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElThreadType}
          setAnchorEl={setAnchorElThreadType}
          value={filters.threadType || []}
          onChange={(val): void => setFilters((prev) => ({ ...prev, threadType: val }))}
          menuOptions={[...curationCommentTabs.map((v) => v.value)]}
          customLabel={
            (val): string => curationCommentTabs.find((v) => v.value === val)?.name || val
          }
        />
      ),
      setAnchor: (target) => setAnchorElThreadType(target),
      chipLabel: () => getChipLabel(filters.threadType || []),
    },
    {
      label: 'Entity type',
      value: 'entityType',
      type: 'menu',
      defaultVal: [],
      check: Boolean(filters.entityType && filters.entityType.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElEntityType}
          setAnchorEl={setAnchorElEntityType}
          value={filters.entityType || []}
          onChange={(val): void => setFilters((prev) => ({ ...prev, entityType: val }))}
          menuOptions={[...curationThreadEntityOptions.map((v) => v.value)]}
          customLabel={
            (val): string => curationThreadEntityOptions.find((v) => v.value === val)?.name || val
          }
        />
      ),
      setAnchor: (target) => setAnchorElEntityType(target),
      chipLabel: () => getChipLabel(filters.entityType || []),
    },
    {
      label: 'Tag',
      value: 'type',
      type: 'menu',
      defaultVal: [],
      check: Boolean(filters.type && filters.type.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElCommentType}
          setAnchorEl={setAnchorElCommentType}
          value={filters.type || []}
          onChange={(val): void => setFilters((prev) => ({ ...prev, type: val }))}
          menuOptions={[...tagOptions.map((v) => v.value)]}
          customLabel={
            (val): string => tagOptions.find((v) => v.value === val)?.name || val
          }
        />
      ),
      setAnchor: (target) => setAnchorElCommentType(target),
      chipLabel: () => getChipLabel(filters.type || []),
    },
    {
      label: 'Genes',
      value: 'genes',
      type: 'menu',
      defaultVal: [],
      check: Boolean((filters.genes?.length || 0) > 0),
      submenu: (
        <CustomGeneList
          anchorElGeneList={anchorElGeneList}
          setAnchorElGeneList={setAnchorElGeneList}
          defaultValue={filters.genes || []}
          onChange={
            (newList): void => setFilters((prev) => (
              { ...prev, genes: newList }
            ))
          }
        />
      ),
      setAnchor: (target) => setAnchorElGeneList(target),
      chipLabel: () => (filters.genes && filters.genes.length > 4 ? (
        `${filters.genes
          .slice(0, 4)
          .map((g) => g.gene.toUpperCase())
          .join('; ')} + ${filters.genes.length - 4} more`
      ) : (
        filters.genes
          ?.map((g) => g.gene.toUpperCase())
          .join('; ') || ''
      )),
    },
    ...DiagnosisFilterOptions({
      filters,
      setFilters,
      endDivider: false,
    }),
  ];
}
