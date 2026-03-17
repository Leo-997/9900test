import {
  Divider,
} from '@mui/material';
import useMatchGenesToList from '@/hooks/useMatchGenesToList';
import { Dispatch, SetStateAction, useState } from 'react';
import { chromosomes, classes, cnvCNTypeOptions } from '../../constants/options';
import { FilterOption, ICNVSearchOptions } from '../../types/Search.types';
import CustomGeneList from '../GeneFilter/CustomGeneList';
import ListMenu from '../SearchFilterBar/ListMenu';
import RangeMenu from '../SearchFilterBar/RangeMenu';

interface ICNVFilterOptionsProps {
  toggled: ICNVSearchOptions;
  setToggled: Dispatch<SetStateAction<ICNVSearchOptions>>;
  emptyOptions: ICNVSearchOptions;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function CNVFilterOptions({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  setLoading,
}: ICNVFilterOptionsProps): FilterOption[] {
  const getMatchingList = useMatchGenesToList(toggled.genename);

  const cnDefaults = [0, Infinity] as const;

  const [anchorElCN, setAnchorElCN] = useState<null | HTMLElement>(null);
  const [anchorElCNType, setAnchorElCNType] = useState<null | HTMLElement>(null);
  const [anchorElGeneName, setAnchorElGeneName] = useState<null | HTMLElement>(null);
  const [anchorElChromosome, setAnchorElChromosome] = useState<null | HTMLElement>(null);
  const [anchorElClass, setAnchorElClass] = useState<null | HTMLElement>(null);

  const filterOptions: FilterOption[] = [
    {
      label: 'CN Range',
      value: 'cn',
      type: 'menu',
      check: Boolean(toggled.cn
        && (
          toggled.cn[0] > cnDefaults[0]
          || toggled.cn[1] < cnDefaults[1]
        )),
      submenu: (
        <RangeMenu
          anchorEl={anchorElCN}
          setAnchorEl={setAnchorElCN}
          value={toggled.cn || cnDefaults}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, cn: newValue as number[] } : prev
          ))}
          defaultRange={cnDefaults}
          loading={loading}
          customMinLabel="Below"
          customMaxLabel="Above"
          rangeType="outside"
        />
      ),
      setAnchor: (target) => setAnchorElCN(target),
      chipLabel: (): string => {
        const [min, max] = toggled.cn || cnDefaults;
        const defaultMin = cnDefaults[0];
        const defaultMax = cnDefaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `cn <= ${min} or cn >= ${max}`;
        } if (min > defaultMin) {
          return `cn <= ${min}`;
        } if (max < defaultMax) {
          return `cn >= ${max}`;
        }
        return '';
      },
      defaultVal: { min: 0, max: Infinity, defaults: [0, Infinity] },
    },
    {
      label: 'CN Type',
      value: 'cnType',
      type: 'menu',
      check: Boolean(toggled.cnType.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElCNType}
          setAnchorEl={setAnchorElCNType}
          value={toggled.cnType}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, cnType: newValue } : prev
          ))}
          menuOptions={cnvCNTypeOptions.map((o) => o.name)}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElCNType(target),
      chipLabel: (): string => (toggled.cnType.length > 4 ? (
        `${toggled.cnType
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.cnType.length - 4} more`
      ) : (
        toggled.cnType
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
    {
      label: 'LOH',
      value: 'cnloh',
      type: 'item',
      check: Boolean(toggled.cnloh),
      divider: <Divider />,
    },
    {
      label: 'Chromosome',
      value: 'chromosome',
      type: 'menu',
      check: Boolean(toggled.chromosome.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElChromosome}
          setAnchorEl={setAnchorElChromosome}
          value={toggled.chromosome}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, chromosome: newValue } : prev
          ))}
          menuOptions={chromosomes}
          customLabel={(chr: string): string => `Chr ${chr}`}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElChromosome(target),
      chipLabel: () => (toggled.chromosome.length > 4 ? (
        `${toggled.chromosome
          .slice(0, 4)
          .map((g) => `Chr ${g}`)
          .join('; ')} + ${toggled.chromosome.length - 4} more`
      ) : (
        toggled.chromosome
          .map((g) => `Chr ${g}`)
          .join('; ')
      )),
    },
    {
      label: 'Genes',
      value: 'genename',
      type: 'menu',
      check: Boolean(toggled.genename.length > 0),
      submenu: (
        <CustomGeneList
          anchorElGeneList={anchorElGeneName}
          setAnchorElGeneList={setAnchorElGeneName}
          defaultValue={toggled.genename}
          onChange={
            (newList): void => setToggled(
              (prev) => ({ ...(prev || emptyOptions), genename: newList }),
            )
          }
        />
      ),
      setAnchor: (target) => setAnchorElGeneName(target),
      chipLabel: getMatchingList,
    },
    {
      label: 'Class',
      value: 'classpath',
      type: 'menu',
      check: Boolean(toggled.classpath.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElClass}
          setAnchorEl={setAnchorElClass}
          value={toggled.classpath}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, classpath: newValue } : prev
          ))}
          menuOptions={[...classes]}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElClass(target),
      chipLabel: () => (toggled.classpath.length > 4 ? (
        `${toggled.classpath
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.classpath.length - 4} more`
      ) : (
        toggled.classpath
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'Reportable',
      value: 'reportable',
      type: 'item',
      check: Boolean(toggled.reportable),
    },
  ];

  return filterOptions;
}
