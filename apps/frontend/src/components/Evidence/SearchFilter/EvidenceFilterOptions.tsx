import CitationsAndResourcesFilterOptions from '@/components/SearchFilterBar/CitationsAndResourcesFilterOptions';
import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import { Divider } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { IEvidenceLinkFilters, IEvidenceQuery } from '../../../types/Evidence/Evidences.types';
import { FilterOption } from '../../../types/Search.types';

export interface IProps {
  toggled: IEvidenceLinkFilters;
  setToggled: Dispatch<SetStateAction<IEvidenceLinkFilters>>;
  setEvidenceFilters: Dispatch<SetStateAction<IEvidenceQuery>>;
  displayDiagnosisFilters?: boolean;
}

export default function EvidenceFilterOptions({
  toggled,
  setToggled,
  setEvidenceFilters,
  displayDiagnosisFilters = true,
}: IProps): FilterOption[] {
  return [
    {
      label: 'Hide Resources',
      value: 'hideResources',
      type: 'item',
      check: toggled.hideResources,
    },
    {
      label: 'Hide Citations',
      value: 'hideCitations',
      type: 'item',
      check: toggled.hideCitations,
      divider: (
        <Divider />
      ),
    },
    ...CitationsAndResourcesFilterOptions({
      filters: toggled,
      setFilters: setEvidenceFilters,
      hasDivider: displayDiagnosisFilters,
    }),
    ...(
      displayDiagnosisFilters
        ? DiagnosisFilterOptions({ filters: toggled, setFilters: setToggled, endDivider: false })
        : []
    ),
  ];
}
