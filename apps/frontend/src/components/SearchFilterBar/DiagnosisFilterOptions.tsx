import { Divider } from '@mui/material';
import {
  Dispatch, SetStateAction, useCallback, useState,
} from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { FilterOption } from '@/types/Search.types';
import { IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import ListMenu from './ListMenu';

export type DiagnosisFilters = Pick<
  IAnalysisSetFilters,
 'zero2Category'
  | 'zero2Subcat1'
  | 'zero2Subcat2'
  | 'zero2FinalDiagnosis'
>;

interface IProps<T extends DiagnosisFilters>{
  filters: T;
  setFilters: Dispatch<SetStateAction<T>>;
  loading?: boolean;
  endDivider?: boolean;
  disabled?: boolean;
}

export default function DiagnosisFilterOptions<T extends DiagnosisFilters>({
  filters,
  setFilters,
  loading = false,
  endDivider = true,
  disabled,
}: IProps<T>): FilterOption[] {
  const zeroDashSdk = useZeroDashSdk();

  const [anchorElCategory, setAnchorElCategory] = useState<null | HTMLElement>(null);
  const [anchorElSubcat1, setAnchorElSubcat1] = useState<null | HTMLElement>(null);
  const [anchorElSubcat2, setAnchorElSubcat2] = useState<null | HTMLElement>(null);
  const [anchorElFinalDiagnosis, setAnchorElFinalDiagnosis] = useState<null | HTMLElement>(null);

  const getChipLabel = (list: string[]): string => (
    list.length > 1 ? (
      `${list
        ?.slice(0, 1)
        .map((g) => g.toUpperCase())
        .join('; ')} + ${
        list.length - 1
      } more`
    ) : (
      list
        ?.map((g) => g.toUpperCase())
        .join('; ')
    )
  );

  const getCategories = useCallback(() => (
    zeroDashSdk
      .curation.analysisSets.getZero2Categories({
        zero2Subcat1: filters.zero2Subcat1,
        zero2Subcat2: filters.zero2Subcat2,
        zero2FinalDiagnosis: filters.zero2FinalDiagnosis,
      })
  ), [
    filters.zero2Subcat1,
    filters.zero2Subcat2,
    filters.zero2FinalDiagnosis,
    zeroDashSdk.curation.analysisSets,
  ]);

  const getSubcat1 = useCallback(() => (
    zeroDashSdk
      .curation.analysisSets.getZero2Subcategory1({
        zero2Category: filters.zero2Category,
        zero2Subcat2: filters.zero2Subcat2,
        zero2FinalDiagnosis: filters.zero2FinalDiagnosis,
      })
  ), [
    filters.zero2Category,
    filters.zero2Subcat2,
    filters.zero2FinalDiagnosis,
    zeroDashSdk.curation.analysisSets,
  ]);

  const getSubcat2 = useCallback(() => (
    zeroDashSdk
      .curation.analysisSets.getZero2Subcategory2({
        zero2Category: filters.zero2Category,
        zero2Subcat1: filters.zero2Subcat1,
        zero2FinalDiagnosis: filters.zero2FinalDiagnosis,
      })
  ), [
    filters.zero2Category,
    filters.zero2Subcat1,
    filters.zero2FinalDiagnosis,
    zeroDashSdk.curation.analysisSets,
  ]);

  const getSubcatFinalDiag = useCallback(() => (
    zeroDashSdk
      .curation.analysisSets.getZero2FinalDiagnosis({
        zero2Category: filters.zero2Category,
        zero2Subcat1: filters.zero2Subcat1,
        zero2Subcat2: filters.zero2Subcat2,
      })
  ), [
    filters.zero2Category,
    filters.zero2Subcat1,
    filters.zero2Subcat2,
    zeroDashSdk.curation.analysisSets,
  ]);

  return [
    {
      label: 'Zero 2 Category',
      value: 'zero2Category',
      type: 'menu',
      check: Boolean(filters.zero2Category?.length),
      disabled,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElCategory}
          setAnchorEl={setAnchorElCategory}
          value={filters.zero2Category || []}
          onChange={(newValue): void => setFilters((prev) => (
            prev ? { ...prev, zero2Category: newValue } : prev
          ))}
          menuOptionsFetch={getCategories}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElCategory(target),
      chipLabel: () => getChipLabel(filters.zero2Category || []),
    },
    {
      label: 'Zero 2 Subcategory 1',
      value: 'zero2Subcat1',
      type: 'menu',
      check: Boolean(filters.zero2Subcat1?.length),
      disabled,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElSubcat1}
          setAnchorEl={setAnchorElSubcat1}
          value={filters.zero2Subcat1 || []}
          onChange={(newValue): void => setFilters((prev) => (
            prev ? { ...prev, zero2Subcat1: newValue } : prev
          ))}
          menuOptionsFetch={getSubcat1}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElSubcat1(target),
      chipLabel: () => getChipLabel(filters.zero2Subcat1 || []),
    },
    {
      label: 'Zero 2 Subcategory 2',
      value: 'zero2Subcat2',
      type: 'menu',
      check: Boolean(filters.zero2Subcat2?.length),
      disabled,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElSubcat2}
          setAnchorEl={setAnchorElSubcat2}
          value={filters.zero2Subcat2 || []}
          onChange={(newValue): void => setFilters((prev) => (
            prev ? { ...prev, zero2Subcat2: newValue } : prev
          ))}
          menuOptionsFetch={getSubcat2}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElSubcat2(target),
      chipLabel: () => getChipLabel(filters.zero2Subcat2 || []),
    },
    {
      label: 'Zero 2 Final Diagnosis',
      value: 'zero2FinalDiagnosis',
      type: 'menu',
      check: Boolean(filters.zero2FinalDiagnosis?.length),
      disabled,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElFinalDiagnosis}
          setAnchorEl={setAnchorElFinalDiagnosis}
          value={filters.zero2FinalDiagnosis || []}
          onChange={(newValue): void => setFilters((prev) => (
            prev ? { ...prev, zero2FinalDiagnosis: newValue } : prev
          ))}
          menuOptionsFetch={getSubcatFinalDiag}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElFinalDiagnosis(target),
      chipLabel: () => getChipLabel(filters.zero2FinalDiagnosis || []),
      divider: endDivider ? <Divider /> : undefined,
    },
  ];
}
