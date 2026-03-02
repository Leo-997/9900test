import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import useMatchGenesToList from '@/hooks/useMatchGenesToList';
import {
  Divider,
} from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  chromosomes, classes, fusionEvents, inframeOptions, platformOptions,
} from '../../constants/options';
import { FilterOption, ISVSearchOptions } from '../../types/Search.types';
import CustomGeneList from '../GeneFilter/CustomGeneList';
import ListMenu from '../SearchFilterBar/ListMenu';

export interface ISVFilterOptionsProps {
  toggled: ISVSearchOptions;
  setToggled: Dispatch<SetStateAction<ISVSearchOptions>>;
  emptyOptions: ISVSearchOptions;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  isGermline?: boolean;
}

export default function SVFilterOptions({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  setLoading,
  isGermline = false,
}: ISVFilterOptionsProps): FilterOption[] {
  const canChangeGeneList = useIsUserAuthorised('curation.germline.gene.list.read') || !isGermline;
  const getMatchingList = useMatchGenesToList(toggled.genename);

  const [anchorElInframe, setAnchorElInframe] = useState<null | HTMLElement>(null);
  const [anchorElPlatform, setAnchorElPlatform] = useState<null | HTMLElement>(null);
  const [anchorElRNAConfidence, setAnchorElRNAConfidence] = useState<null | HTMLElement>(null);
  const [anchorElFusionEvent, setAnchorElFusionEvent] = useState<null | HTMLElement>(null);
  const [anchorElGeneName, setAnchorElGeneName] = useState<null | HTMLElement>(null);
  const [anchorElChromosome, setAnchorElChromosome] = useState<null | HTMLElement>(null);
  const [anchorElClass, setAnchorElClass] = useState<null | HTMLElement>(null);

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
      disabled: !canChangeGeneList,
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
      label: 'Inframe',
      value: 'inframe',
      type: 'menu',
      check: Boolean(toggled.inframe.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElInframe}
          setAnchorEl={setAnchorElInframe}
          value={toggled.inframe}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, inframe: newValue } : prev
          ))}
          menuOptions={inframeOptions}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElInframe(target),
      chipLabel: () => (toggled.inframe.length > 4 ? (
        `${toggled.inframe
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.inframe.length - 4} more`
      ) : (
        toggled.inframe
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
      divider: <Divider />,
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
    },
    {
      label: 'RNA Confidence',
      value: 'rnaConfidence',
      type: 'menu',
      check: Boolean(toggled.rnaConfidence.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElRNAConfidence}
          setAnchorEl={setAnchorElRNAConfidence}
          value={toggled.rnaConfidence}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, rnaConfidence: newValue } : prev
          ))}
          menuOptions={['High', 'Med', 'Low']}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElRNAConfidence(target),
      chipLabel: () => (toggled.rnaConfidence.length > 4 ? (
        `${toggled.rnaConfidence
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.rnaConfidence.length - 4} more`
      ) : (
        toggled.rnaConfidence
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
    {
      label: 'Fusion Event',
      value: 'fusionevent',
      type: 'menu',
      check: Boolean(toggled.fusionevent.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElFusionEvent}
          setAnchorEl={setAnchorElFusionEvent}
          value={toggled.fusionevent}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, fusionevent: newValue } : prev
          ))}
          menuOptions={fusionEvents}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElFusionEvent(target),
      chipLabel: () => (toggled.fusionevent.length > 4 ? (
        `${toggled.fusionevent
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.fusionevent.length - 4} more`
      ) : (
        toggled.fusionevent
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
