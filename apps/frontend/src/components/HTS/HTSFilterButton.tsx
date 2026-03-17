import { IDrugScreen } from '@/types/Drugs/Screen.types';
import { IHTSSearchOptions } from '@/types/Search.types';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import ListMenu from '../SearchFilterBar/ListMenu';

interface IProps {
  toggled: IHTSSearchOptions;
  setToggled: Dispatch<SetStateAction<IHTSSearchOptions>>;
  screens: IDrugScreen[];
  clearFilters: () => void;
}

export function HTSFilterButton({
  toggled,
  setToggled,
  screens,
  clearFilters,
}: IProps): JSX.Element {
  const [targetsAnchor, setTargetsAnchor] = useState<HTMLElement | null>(null);
  const [pathwaysAnchor, setPathwaysAnchor] = useState<HTMLElement | null>(null);

  const sortAndRemoveDupes = (list: string[]): string[] => (
    list.filter((elem, index, self) => (
      self.findIndex((e) => e.toLowerCase() === elem.toLowerCase()) === index
    ))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  );

  const getChipLabel = (list: string[], length = 4): string => (
    list.length > length ? (
      `${list
        ?.slice(0, length)
        .map((g) => g.toUpperCase().split('::')[0])
        .join('; ')} + ${
        list.length - length
      } more`
    ) : (
      list
        ?.map((g) => g.toUpperCase().split('::')[0])
        .join('; ')
    )
  );

  return (
    <FilterButton
      toggled={toggled}
      setToggled={setToggled}
      clearFilters={clearFilters}
      filterOptions={[
        {
          type: 'menu',
          label: 'Targets',
          value: 'targets',
          defaultVal: [],
          check: Boolean(toggled.targets?.length),
          setAnchor: setTargetsAnchor,
          chipLabel: () => getChipLabel(toggled.targets || [], 4),
          submenu: (
            <ListMenu
              anchorEl={targetsAnchor}
              setAnchorEl={setTargetsAnchor}
              value={toggled.targets || []}
              onChange={(newValue): void => setToggled((prev) => (
                prev ? { ...prev, targets: newValue } : prev
              ))}
              menuOptions={
                sortAndRemoveDupes(
                  screens.flatMap((s) => s.targets.map((t) => `${t.name}::${t.id}`)),
                )
              }
              customLabel={(u): string => u.split('::')[0]}
            />
          ),
        },
        {
          type: 'menu',
          label: 'Pathways',
          value: 'pathways',
          defaultVal: [],
          check: Boolean(toggled.pathways?.length),
          setAnchor: setPathwaysAnchor,
          chipLabel: () => getChipLabel(toggled.pathways || [], 4),
          submenu: (
            <ListMenu
              anchorEl={pathwaysAnchor}
              setAnchorEl={setPathwaysAnchor}
              value={toggled.pathways || []}
              onChange={(newValue): void => setToggled((prev) => (
                prev ? { ...prev, pathways: newValue } : prev
              ))}
              menuOptions={
                sortAndRemoveDupes(
                  screens.flatMap((s) => s.classes.map((t) => `${t.name}::${t.id}`)),
                )
              }
              customLabel={(u): string => u.split('::')[0]}
            />
          ),
        },
      ]}
    />
  );
}
