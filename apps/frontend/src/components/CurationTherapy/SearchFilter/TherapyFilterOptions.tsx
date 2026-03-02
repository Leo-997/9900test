import {
  Dispatch, SetStateAction, useEffect, useState,
} from 'react';
import { FilterOption } from '@/types/Search.types';
import { ITherapiesQuery } from '@/types/Therapies/CurationTherapies.types';
import ListMenu from '@/components/SearchFilterBar/ListMenu';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IDrugMetadata, IExternalDrug } from '@/types/Drugs/Drugs.types';

export interface IProps {
  filters: ITherapiesQuery;
  setFilters: Dispatch<SetStateAction<ITherapiesQuery>>;
}

export default function TherapyFilterOptions({
  filters,
  setFilters,
}: IProps): FilterOption[] {
  const zeroDashSdk = useZeroDashSdk();

  const [anchorElDrugClass, setAnchorElDrugClass] = useState<null | HTMLElement>(null);
  const [drugClassOptions, setDrugClassOptions] = useState<IDrugMetadata[]>([]);
  const [anchorElClinicalDrug, setAnchorElClinicalDrug] = useState<null | HTMLElement>(null);
  const [clinicalDrugOptions, setClinicalDrugOptions] = useState<IExternalDrug[]>([]);

  useEffect(() => {
    const fetchDrugClassOptions = async (): Promise<void> => {
      const response = await zeroDashSdk.services.drugs.getDrugClasses({});
      setDrugClassOptions(response);
    };

    fetchDrugClassOptions();
  }, [zeroDashSdk.services.drugs]);

  useEffect(() => {
    const fetchClinicalDrugOptions = async (): Promise<void> => {
      const response = await zeroDashSdk.services.drugs.getDrugs({});
      setClinicalDrugOptions(response);
    };

    fetchClinicalDrugOptions();
  }, [zeroDashSdk.services.drugs]);

  const getChipLabel = (list: string[], length = 2): string => (
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
      label: 'Include chemotherapy',
      value: 'includesChemotherapy',
      type: 'item',
      check: Boolean(filters.includesChemotherapy),
    },
    {
      label: 'Include radiotherapy',
      value: 'includesRadiotherapy',
      type: 'item',
      check: Boolean(filters.includesRadiotherapy),
    },
    {
      label: 'Drug class',
      value: 'drugClass',
      type: 'menu',
      defaultVal: [],
      check: Boolean(filters.drugClassIds && filters.drugClassIds.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElDrugClass}
          setAnchorEl={setAnchorElDrugClass}
          value={filters.drugClassIds || []}
          onChange={(val): void => setFilters((prev) => ({ ...prev, drugClassIds: val }))}
          menuOptions={drugClassOptions.length
            // save both drug class' name and id, as id is needed to be passed to BE
            ? [...drugClassOptions.map((d) => `${d.name}::${d.id}`)]
            : []}
          customLabel={
            (val): string => val.split('::')[0]
          }
        />
      ),
      setAnchor: (target) => setAnchorElDrugClass(target),
      chipLabel: () => getChipLabel(filters.drugClassIds?.map((d) => d.split('::')[0]) || []),
    },
    {
      label: 'Drug',
      value: 'clinicalDrug',
      type: 'menu',
      defaultVal: [],
      check: Boolean(filters.clinicalDrugIds && filters.clinicalDrugIds.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElClinicalDrug}
          setAnchorEl={setAnchorElClinicalDrug}
          value={filters.clinicalDrugIds || []}
          onChange={(val): void => setFilters((prev) => ({ ...prev, clinicalDrugIds: val }))}
          menuOptions={clinicalDrugOptions.length
            // save both clinical drug's name and id, as id is needed to be passed to BE
            ? [...clinicalDrugOptions.map((c) => `${c.name}::${c.versionId}`)]
            : []}
          customLabel={
            (val): string => val.split('::')[0]
          }
        />
      ),
      setAnchor: (target) => setAnchorElClinicalDrug(target),
      chipLabel: () => getChipLabel(filters.clinicalDrugIds?.map((c) => c.split('::')[0]) || []),
    },
  ];
}
