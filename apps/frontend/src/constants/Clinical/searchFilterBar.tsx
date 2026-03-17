import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { ISortMenuOption } from '../../types/misc.types';

export const clinicalSortMenu: ISortMenuOption<string>[] = [
  {
    name: 'MTB Meeting Date',
    value: 'MTB Meeting Date:desc',
    icon: <ArrowDownIcon />,
  },
  {
    name: 'MTB Meeting Date',
    value: 'MTB Meeting Date:asc',
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
];
