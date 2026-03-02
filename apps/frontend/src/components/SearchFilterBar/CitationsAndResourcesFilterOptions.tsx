import {
  Dispatch, SetStateAction, useState,
} from 'react';
import { Divider } from '@mui/material';
import { FilterOption } from '@/types/Search.types';
import ListMenuTextInput from './ListMenuTextInput';
import ListMenuYearInput from './ListMenuYearInput';

interface ICitationsAndResourcesFilterOptions {
  title?: string[];
  author?: string[];
  year?: number | null;
  publication?: string[];
  pubmedId?: string[];
}

interface IProps<T extends ICitationsAndResourcesFilterOptions>{
  filters: T;
  setFilters: Dispatch<SetStateAction<T>>;
  hasDivider?: boolean;
  loading?: boolean;
}

export default function CitationsAndResourcesFilterOptions<
T extends ICitationsAndResourcesFilterOptions
>({
  filters,
  setFilters,
  hasDivider = false,
  loading = false,
}: IProps<T>): FilterOption[] {
  const [anchorElTitle, setAnchorElTitle] = useState<null | HTMLElement>(null);
  const [anchorElAuthor, setAnchorElAuthor] = useState<null | HTMLElement>(null);
  const [anchorElYear, setAnchorElYear] = useState<null | HTMLElement>(null);
  const [anchorElPublication, setAnchorElPublication] = useState<null | HTMLElement>(null);

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

  return [
    {
      label: 'Title',
      value: 'title',
      type: 'menu',
      check: Boolean(filters.title?.length),
      submenu: (
        <ListMenuTextInput
          chipListHeading="Title"
          anchorEl={anchorElTitle}
          setAnchorEl={setAnchorElTitle}
          currentFilterValue={filters.title || []}
          loading={loading}
          handleApplyFilter={(newValue: string[]):void => {
            setFilters((prev) => ({
              ...prev,
              title: newValue,
            }));
            setAnchorElTitle(null);
          }}
        />
      ),
      setAnchor: (target) => setAnchorElTitle(target),
      chipLabel: () => getChipLabel(filters.title || []),
    },
    {
      label: 'Author',
      value: 'author',
      type: 'menu',
      check: Boolean(filters.author?.length),
      submenu: (
        <ListMenuTextInput
          chipListHeading="Author"
          anchorEl={anchorElAuthor}
          setAnchorEl={setAnchorElAuthor}
          currentFilterValue={filters.author || []}
          loading={loading}
          handleApplyFilter={(newValue: string[]):void => {
            setFilters((prev) => ({
              ...prev,
              author: newValue,
            }));
            setAnchorElAuthor(null);
          }}
        />
      ),
      setAnchor: (target) => setAnchorElAuthor(target),
      chipLabel: () => getChipLabel(filters.author || []),
    },
    {
      label: 'Year',
      value: 'year',
      type: 'menu',
      check: Boolean(filters.year),
      submenu: (
        <ListMenuYearInput
          anchorEl={anchorElYear}
          setAnchorEl={setAnchorElYear}
          currentFilterValue={filters.year || null}
          loading={loading}
          handleApplyFilter={(newValue: number | null):void => {
            setFilters((prev) => ({
              ...prev,
              year: newValue,
            }));
          }}
        />
      ),
      setAnchor: (target) => setAnchorElYear(target),
      chipLabel: () => filters.year?.toString() || '',
    },
    {
      label: 'Publication',
      value: 'publication',
      type: 'menu',
      check: Boolean(filters.publication?.length),
      submenu: (
        <ListMenuTextInput
          chipListHeading="Publication"
          anchorEl={anchorElPublication}
          setAnchorEl={setAnchorElPublication}
          currentFilterValue={filters.publication || []}
          loading={loading}
          handleApplyFilter={(newValue: string[]):void => {
            setFilters((prev) => ({
              ...prev,
              publication: newValue,
            }));
            setAnchorElPublication(null);
          }}
        />
      ),
      setAnchor: (target) => setAnchorElPublication(target),
      chipLabel: () => getChipLabel(filters.publication || []),
      divider: hasDivider ? <Divider /> : undefined,
    },
  ];
}
