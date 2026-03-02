import {
  Dispatch, SetStateAction, useCallback, useEffect, useState,
} from 'react';
import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import GeneMutationFilterMenu from '@/components/SearchFilterBar/GeneMutationFilterMenu';
import { geneVariantTypeOptions } from '@/constants/Common/variants';
import ListMenu from '@/components/SearchFilterBar/ListMenu';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { FilterOption } from '../../../types/Search.types';
import { IClinicalCommentsQuery } from '../../../types/Comments/ClinicalComments.types';
import CustomGeneList from '../../GeneFilter/CustomGeneList';
import type { IClassifierVersion } from '@/types/Classifiers.types';

interface IProps {
  filters: IClinicalCommentsQuery;
  setFilters: Dispatch<SetStateAction<IClinicalCommentsQuery>>;
}

export default function ClinicalCommentsFilterOptions({
  filters,
  setFilters,
}: IProps): FilterOption[] {
  const zeroDashSdk = useZeroDashSdk();

  const [anchorElGeneList, setAnchorElGeneList] = useState<null | HTMLElement>(null);
  const [
    anchorElGeneMutationList,
    setAnchorElGeneMutationList,
  ] = useState<null | HTMLElement>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [
    anchorElClassifiers,
    setAnchorElClassifiers,
  ] = useState<null | HTMLElement>(null);
  const [classifiers, setClassifiers] = useState<IClassifierVersion[]>([]);

  const getGroupOptions = useCallback(async (search?: string): Promise<string[]> => (
    classifiers.length
      ? zeroDashSdk.methylation.getClassifierGroups({ search })
        .then((resp) => resp
          .map((g) => {
            const classifier = classifiers.find((c) => c.id === g.methClassifierId);
            const classifierVersion = classifier ? `${classifier.description} version ${classifier.version}` : 'Unknown classifier';
            return `${g.groupName}:${g.methGroupId}:${classifierVersion}`;
          }))
      : []
  ), [classifiers, zeroDashSdk.methylation]);

  useEffect(() => {
    zeroDashSdk.methylation.getClassifiers()
      .then((resp) => setClassifiers(resp));
  }, [zeroDashSdk.methylation]);

  return [
    {
      label: 'Show hidden comments',
      value: 'isHiddenInArchive',
      type: 'item',
      check: Boolean(filters.isHiddenInArchive),
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
    {
      label: 'Gene mutation',
      value: 'geneMutations',
      type: 'menu',
      defaultVal: [],
      check: Boolean((filters.geneMutations?.length || 0) > 0),
      submenu: (
        <GeneMutationFilterMenu
          anchorEl={anchorElGeneMutationList}
          setAnchorEl={setAnchorElGeneMutationList}
          onChange={(newList): void => setFilters((prev) => (
            { ...prev, geneMutations: newList }
          ))}
        />
      ),
      setAnchor: (target) => setAnchorElGeneMutationList(target),
      chipLabel: () => (filters.geneMutations && filters.geneMutations.length > 4 ? (
        `${filters.geneMutations
          .slice(0, 4)
          .map((mutation) => `${geneVariantTypeOptions.find((v) => v.value === mutation.variantType)?.name}: ${mutation.gene}`)
          .join('; ')} + ${filters.geneMutations.length - 4} more`
      ) : (
        filters.geneMutations
          ?.map((mutation) => `${geneVariantTypeOptions.find((v) => v.value === mutation.variantType)?.name}: ${mutation.gene}`)
          .join('; ') || ''
      )),
    },
    {
      label: 'Classifier',
      value: 'classifiers',
      type: 'menu',
      defaultVal: [],
      check: Boolean((filters.classifiers?.length || 0) > 0),
      submenu: (
        <ListMenu
          value={selectedGroups}
          onChange={(val): void => {
            setSelectedGroups(val);
            setFilters((prev) => (
              { ...prev, classifiers: val.map((v) => v.split(':')[1]) }
            ));
          }}
          customLabel={(option): string => option.split(':')[0]}
          groupBy={(option): string => option.split(':')[2]}
          anchorEl={anchorElClassifiers}
          setAnchorEl={setAnchorElClassifiers}
          menuOptionsFetch={getGroupOptions}
        />
      ),
      setAnchor: (target) => setAnchorElClassifiers(target),
      chipLabel: () => (selectedGroups && selectedGroups.length > 1 ? (
        `${selectedGroups
          .slice(0, 1)
          .map((group) => group.split(':')[0])
          .join('; ')} + ${selectedGroups.length - 1} more`
      ) : (
        selectedGroups
          ?.map((group) => group.split(':')[0])
          .join('; ') || ''
      )),
    },
    ...DiagnosisFilterOptions({ filters, setFilters }),
  ];
}
