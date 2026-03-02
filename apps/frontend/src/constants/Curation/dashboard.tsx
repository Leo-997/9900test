import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { ISortMenuOption } from '../../types/misc.types';

export const dashboardSortMenu: ISortMenuOption<string>[] = [
  {
    name: 'Manifest Created',
    value: 'Manifest Created:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Manifest Created',
    value: 'Manifest Created:asc',
    icon: <ArrowUpIcon />,
  },
  {
    name: 'Curation Date',
    value: 'Curation Date:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Curation Date',
    value: 'Curation Date:asc',
    icon: <ArrowUpIcon />,
  },
  {
    name: 'Enrolment Date',
    value: 'Enrolment Date:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Enrolment Date',
    value: 'Enrolment Date:asc',
    icon: <ArrowUpIcon />,
  },
  {
    name: 'Purity',
    value: 'Purity:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Purity',
    value: 'Purity:asc',
    icon: <ArrowUpIcon />,
  },
  {
    name: 'Mutation Burden',
    value: 'Mutation Burden:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'Mutation Burden',
    value: 'Mutation Burden:asc',
    icon: <ArrowUpIcon />,
  },
];
