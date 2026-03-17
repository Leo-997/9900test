import { Dispatch, SetStateAction, useMemo, useState, type JSX } from 'react';
import { reportOptions, reportTypes } from '../../../constants/Reports/reports';
import { approvalStatuses } from '../../../constants/Reports/status';
import { useUser } from '../../../contexts/UserContext';
import { IGetReportsQuery } from '../../../types/Reports/Reports.types';
import { FilterOption } from '../../../types/Search.types';
import FilterButton from '../../SearchFilterBar/Buttons/FilterButton';
import ListMenu from '../../SearchFilterBar/ListMenu';

interface IProps {
  toggled: IGetReportsQuery;
  setToggled: Dispatch<SetStateAction<IGetReportsQuery>>;
  loading: boolean;
}

export default function ReportFilterButton({
  toggled,
  setToggled,
  loading,
}: IProps): JSX.Element {
  const { users } = useUser();
  const [anchorElStatus, setAnchorElStatus] = useState<null | HTMLElement>(null);
  const [anchorElType, setAnchorElType] = useState<null | HTMLElement>(null);
  const [anchorElUsers, setAnchorElUsers] = useState<null | HTMLElement>(null);

  const clearFilters = (): void => {
    setToggled({});
  };

  const getChipLabel = (list: string[], length = 4): string => (
    list.length > length ? (
      `${list
        ?.slice(0, length)
        .map((g) => g.toUpperCase())
        .join('; ')} + ${
        list.length - length
      } more`
    ) : (
      list
        ?.map((g) => g.toUpperCase())
        .join('; ')
    )
  );

  const options = useMemo<FilterOption[]>(() => ([
    {
      label: 'Status',
      value: 'statuses',
      type: 'menu',
      defaultVal: [],
      check: Boolean(toggled.statuses && toggled.statuses.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElStatus}
          setAnchorEl={setAnchorElStatus}
          value={toggled.statuses || []}
          onChange={(val): void => setToggled((prev) => ({ ...prev, statuses: val }))}
          menuOptions={[...approvalStatuses]}
        />
      ),
      setAnchor: (target) => setAnchorElStatus(target),
      chipLabel: () => getChipLabel(toggled.statuses || []),
    },
    {
      label: 'Type',
      value: 'types',
      type: 'menu',
      defaultVal: [],
      check: Boolean(toggled.types && toggled.types.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElType}
          setAnchorEl={setAnchorElType}
          value={toggled.types || []}
          onChange={(val): void => setToggled((prev) => ({ ...prev, types: val }))}
          menuOptions={[...reportTypes]}
          customLabel={(o): string => reportOptions.find((r) => r.value === o)?.name || o}
        />
      ),
      setAnchor: (target) => setAnchorElType(target),
      chipLabel: () => getChipLabel(toggled.types || []),
    },
    {
      label: 'Approvers',
      value: 'approvers',
      type: 'menu',
      defaultVal: [],
      check: Boolean(toggled.approvers?.length),
      submenu: (
        <ListMenu
          anchorEl={anchorElUsers}
          setAnchorEl={setAnchorElUsers}
          value={toggled.approvers || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev
              ? { ...prev, approvers: newValue }
              : prev
          ))}
          menuOptions={
            users.filter((u) => u.givenName && u.familyName)
              .map((u) => u.id)
          }
          customLabel={(o): string => {
            const user = users.find((u) => u.id === o);
            return user ? `${user?.givenName} ${user?.familyName}` : '';
          }}
        />
      ),
      setAnchor: (target) => setAnchorElUsers(target),
      chipLabel: (): string => getChipLabel(
        toggled.approvers
          ? users.filter((u) => toggled.approvers?.includes(u.id))
            .map((u) => `${u?.givenName} ${u?.familyName}`)
          : [],
      ),
    },
  ]), [
    users,
    anchorElStatus,
    anchorElType,
    anchorElUsers,
    setToggled,
    toggled.approvers,
    toggled.statuses,
    toggled.types,
  ]);

  return (
    <FilterButton
      toggled={toggled}
      setToggled={setToggled}
      clearFilters={clearFilters}
      filterOptions={options}
      loading={loading}
    />
  );
}
