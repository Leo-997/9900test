import useMatchGenesToList from '@/hooks/useMatchGenesToList';
import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { chromosomes, classes, platformOptions } from '../../constants/options';
import { FilterOption, ISNVSearchOptions } from '../../types/Search.types';
import ConsequenceMenu from '../Consequence/ConsequenceMenu';
import CustomGeneList from '../GeneFilter/CustomGeneList';
import ListMenu from '../SearchFilterBar/ListMenu';
import RangeMenu from '../SearchFilterBar/RangeMenu';

export interface ISNVFilterOptionsProps {
  toggled: ISNVSearchOptions;
  setToggled: Dispatch<SetStateAction<ISNVSearchOptions>>;
  emptyOptions: ISNVSearchOptions;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function SNVFilterOptions({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  setLoading,
}: ISNVFilterOptionsProps): FilterOption[] {
  const getMatchingList = useMatchGenesToList(toggled.genename);

  const gnomadDefaults = [0, 1];
  const vafDefaults = [0, 1];
  const readsDefaults = [0, Infinity];

  const [anchorElGeneList, setAnchorElGeneList] = useState<null | HTMLElement>(null);
  const [anchorElChromosome, setAnchorElChromosome] = useState<null | HTMLElement>(null);
  const [anchorElClass, setAnchorElClass] = useState<null | HTMLElement>(null);
  const [anchorElConsequence, setAnchorElConsequence] = useState<null | HTMLElement>(null);
  const [anchorElGnomad, setAnchorElGnomad] = useState<null | HTMLElement>(null);
  const [anchorElVAF, setAnchorElVAF] = useState<null | HTMLElement>(null);
  const [anchorElPlatform, setAnchorElPlatform] = useState<null | HTMLElement>(null);
  const [anchorElReads, setAnchorElReads] = useState<null | HTMLElement>(null);

  const filterOptions: FilterOption[] = [
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
          anchorElGeneList={anchorElGeneList}
          setAnchorElGeneList={setAnchorElGeneList}
          defaultValue={toggled.genename}
          onChange={
            (newList): void => setToggled(
              (prev) => ({ ...(prev || emptyOptions), genename: newList }),
            )
          }
        />
      ),
      setAnchor: (target) => setAnchorElGeneList(target),
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
    },
    {
      label: 'Consequence',
      value: 'consequence',
      type: 'menu',
      check: Boolean(toggled.consequence.length > 0),
      submenu: (
        <ConsequenceMenu
          anchorEl={anchorElConsequence}
          setAnchorEl={setAnchorElConsequence}
          toggled={toggled}
          setToggled={setToggled}
        />
      ),
      setAnchor: (target) => setAnchorElConsequence(target),
      chipLabel: () => (toggled.consequence.length > 4 ? (
        `${toggled.consequence
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.consequence.length - 4} more`
      ) : (
        toggled.consequence
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'Include Failed',
      value: 'vcf',
      type: 'item',
      check: Boolean(toggled.vcf),
      divider: <Divider />,
    },
    {
      label: 'GNOMAD Frequency',
      value: 'gnomad',
      type: 'menu',
      check: toggled.gnomad.min > toggled.gnomad.defaults[0]
              || toggled.gnomad.max < toggled.gnomad.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElGnomad}
          setAnchorEl={setAnchorElGnomad}
          value={[toggled.gnomad.min, toggled.gnomad.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev
              ? {
                ...prev,
                gnomad: {
                  min: newValue[0],
                  max: newValue[1],
                  defaults: gnomadDefaults,
                },
              }
              : prev
          ))}
          defaultRange={gnomadDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElGnomad(target),
      chipLabel: (): string => {
        const { min } = toggled.gnomad;
        const { max } = toggled.gnomad;
        const defaultMin = toggled.gnomad.defaults[0];
        const defaultMax = toggled.gnomad.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `<= ${max}`;
        }
        return '';
      },
      defaultVal: { min: 0, max: 1, defaults: [0, 1] },
    },
    {
      label: 'VAF',
      value: 'vaf',
      type: 'menu',
      check: toggled.vaf.min > toggled.vaf.defaults[0]
              || toggled.vaf.max < toggled.vaf.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElVAF}
          setAnchorEl={setAnchorElVAF}
          value={[toggled.vaf.min, toggled.vaf.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev
              ? {
                ...prev,
                vaf: {
                  min: newValue[0],
                  max: newValue[1],
                  defaults: vafDefaults,
                },
              }
              : prev
          ))}
          defaultRange={vafDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElVAF(target),
      chipLabel: (): string => {
        const { min } = toggled.vaf;
        const { max } = toggled.vaf;
        const defaultMin = toggled.vaf.defaults[0];
        const defaultMax = toggled.vaf.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `<= ${max}`;
        }
        return '';
      },
      defaultVal: { min: 0, max: 1, defaults: [0, 1] },
    },
    {
      label: 'Reads',
      value: 'reads',
      type: 'menu',
      check: toggled.reads.min > toggled.reads.defaults[0]
              || toggled.reads.max < toggled.reads.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElReads}
          setAnchorEl={setAnchorElReads}
          value={[toggled.reads.min, toggled.reads.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev
              ? {
                ...prev,
                reads: {
                  min: newValue[0],
                  max: newValue[1],
                  defaults: readsDefaults,
                },
              }
              : prev
          ))}
          defaultRange={readsDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElReads(target),
      chipLabel: (): string => {
        const { min } = toggled.reads;
        const { max } = toggled.reads;
        const defaultMin = toggled.reads.defaults[0];
        const defaultMax = toggled.reads.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `< ${max}`;
        }
        return '';
      },
      defaultVal: { min: 0, max: Infinity, defaults: [0, Infinity] },
    },
    {
      label: 'Platform',
      value: 'platform',
      type: 'menu',
      check: Boolean(toggled.platform.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElPlatform}
          setAnchorEl={setAnchorElPlatform}
          value={toggled.platform}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, platform: newValue } : prev
          ))}
          menuOptions={platformOptions}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElPlatform(target),
      chipLabel: () => (toggled.platform.length > 4 ? (
        `${toggled.platform
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.platform.length - 4} more`
      ) : (
        toggled.platform
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'Bi-Allelic',
      value: 'biallelic',
      type: 'item',
      check: Boolean(toggled.biallelic),
    },
    {
      label: 'LOH',
      value: 'loh',
      type: 'item',
      check: Boolean(toggled.loh),
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
