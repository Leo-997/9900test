import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import RangeMenu from '@/components/SearchFilterBar/RangeMenu';
import { nullUser } from '@/constants/User/user.constant';
import { useUser } from '@/contexts/UserContext';
import { IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import { IUserWithMetadata } from '@/types/Auth/User.types';
import { DateRange, FilterOption } from '@/types/Search.types';
import { Divider as MuiDivider, styled } from '@mui/material';
import dayjs from 'dayjs';
import {
  Dispatch, SetStateAction, useCallback,
  useState,
} from 'react';
import { curationStatuses } from '../../../../../constants/Curation/navigation';
import {
  eventTypes,
} from '../../../../../constants/options';
import { cohorts } from '../../../../../constants/sample';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import ListMenu from '../../../../SearchFilterBar/ListMenu';
import VitalStatus from '../../../../VitalStatus/Gender';
import DashboardDateRangeMenu from '../../Common/SearchFilterSort/DashboardDateRangeMenu';

const Divider = styled(MuiDivider)({
  margin: '0px !important',
});

export interface IDashboardFilterOptionsProps {
  toggled: IAnalysisSetFilters;
  setToggled: Dispatch<SetStateAction<IAnalysisSetFilters>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function DashboardFilterOptions({
  toggled,
  setToggled,
  loading,
  setLoading,
}: IDashboardFilterOptionsProps): FilterOption[] {
  const { users } = useUser();
  const zeroDashSdk = useZeroDashSdk();

  const ageRangeDefaults = [0, 21] as const;
  const purityDefaults = [0, 1] as const;
  const mutBurdenDefaults = [0, Infinity] as const;

  const [anchorElAgeRange, setAnchorElAgeRange] = useState<null | HTMLElement>(null);
  const [anchorElEvent, setAnchorElEvent] = useState<null | HTMLElement>(null);
  const [anchorElCuration, setAnchorElCuration] = useState<null | HTMLElement>(null);
  const [anchorElEnrolment, setAnchorElEnrolment] = useState<null | HTMLElement>(null);
  const [anchorElStudy, setAnchorElStudy] = useState<null | HTMLElement>(null);
  const [anchorElCohort, setAnchorElCohort] = useState<null | HTMLElement>(null);
  const [anchorElCurationStatus, setAnchorElCurationStatus] = useState<null | HTMLElement>(null);
  const [anchorElCurators, setAnchorElCurators] = useState<null | HTMLElement>(null);
  const [anchorElPurity, setAnchorElPurity] = useState<null | HTMLElement>(null);
  const [anchorElMutBurden, setAnchorElMutBurden] = useState<null | HTMLElement>(null);

  const areEnrolledOrWithdrawnActive = toggled.enrolledOnlyCases || toggled.withdrawnCases;

  const handleSetCuration = (dateRange: DateRange): void => {
    setToggled({
      ...toggled,
      startCuration: dateRange.startDate,
      endCuration: dateRange.endDate,
    });
  };

  const handleSetEnrolment = (dateRange: DateRange): void => {
    const format = 'YYYY-MM-DD H:mm:ss';
    const newDateRange = {
      type: dateRange.type,
      startDate: dateRange.startDate
        ? dayjs(dateRange.startDate).startOf('date').format(format).toString()
        : undefined,
      endDate: dateRange.endDate
        ? dayjs(dateRange.endDate).endOf('date').format(format).toString()
        : undefined,
    };
    setToggled({
      ...toggled,
      startEnrolment: newDateRange.startDate,
      endEnrolment: newDateRange.endDate,
    });
  };

  const fetchUsers = (): string[] => {
    const mappedUsers: IUserWithMetadata[] = [
      nullUser,
      ...users.filter((u) => u.groups.map((g) => g.name).includes('Curators')),
    ];

    return mappedUsers.map((u) => `${u.givenName} ${u.familyName}::${u.id}`);
  };

  const fetchStudies = useCallback(async () => {
    const studies = await zeroDashSdk.curation.analysisSets.getAllStudies();
    return studies;
  }, [zeroDashSdk.curation.analysisSets]);

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

  const filterOptions: FilterOption[] = [
    {
      label: 'Show all cases',
      value: 'all',
      type: 'item',
      check: Boolean(toggled.all),
      disabled: areEnrolledOrWithdrawnActive,
    },
    {
      label: 'Expedited only',
      value: 'expedited',
      type: 'item',
      check: Boolean(toggled.expedited),
      disabled: areEnrolledOrWithdrawnActive,
    },
    {
      label: 'Curation Status',
      value: 'curationStatus',
      type: 'menu',
      check: Boolean(toggled.curationStatus?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElCurationStatus}
          setAnchorEl={setAnchorElCurationStatus}
          value={toggled.curationStatus || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, curationStatus: newValue } : prev
          ))}
          menuOptions={Object.keys(curationStatuses)}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElCurationStatus(target),
      chipLabel: () => getChipLabel(toggled.curationStatus || [], 1),
    },
    {
      label: 'Primary Curator',
      value: 'primaryCurators',
      type: 'menu',
      check: Boolean(toggled.primaryCurators?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElCurators}
          setAnchorEl={setAnchorElCurators}
          value={toggled.primaryCurators || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, primaryCurators: newValue } : prev
          ))}
          menuOptions={fetchUsers()}
          customLabel={(u): string => u.split('::')[0]}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElCurators(target),
      chipLabel: () => getChipLabel(toggled.primaryCurators || [], 1),
    },
    {
      label: 'Registered-only patients',
      value: 'enrolledOnlyCases',
      type: 'item',
      check: toggled.enrolledOnlyCases,
      disabled: toggled.withdrawnCases,
    },
    {
      label: 'Withdrawn patients',
      value: 'withdrawnCases',
      type: 'item',
      check: Boolean(toggled.withdrawnCases),
      disabled: toggled.enrolledOnlyCases,
      divider: <Divider />,
    },
    {
      label: 'Female',
      value: 'gender:female',
      type: 'item',
      check: toggled.gender?.includes('female'),
      disabled: areEnrolledOrWithdrawnActive,
      icon: <VitalStatus vitalStatus="Dead" gender="Female" />,
    },
    {
      label: 'Male',
      value: 'gender:male',
      type: 'item',
      check: toggled.gender?.includes('male'),
      disabled: areEnrolledOrWithdrawnActive,
      icon: <VitalStatus vitalStatus="Dead" gender="Male" />,
      divider: <Divider />,
    },
    {
      label: 'Age Range',
      value: 'ageRange',
      type: 'menu',
      check: Boolean(toggled.ageRange
        && (
          toggled.ageRange[0] > ageRangeDefaults[0]
          || toggled.ageRange[1] < ageRangeDefaults[1]
        )),
      disabled: areEnrolledOrWithdrawnActive,
      submenu: (
        <RangeMenu
          anchorEl={anchorElAgeRange}
          setAnchorEl={setAnchorElAgeRange}
          value={toggled.ageRange || ageRangeDefaults}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, ageRange: newValue as number[] } : prev
          ))}
          defaultRange={ageRangeDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElAgeRange(target),
      chipLabel: (): string => {
        const [min, max] = toggled.ageRange || ageRangeDefaults;
        const defaultMin = ageRangeDefaults[0];
        const defaultMax = ageRangeDefaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max} y/o`;
        } if (min > defaultMin) {
          return `${min} + y/o`;
        } if (max < defaultMax) {
          return `up to ${max} y/o`;
        }
        return '';
      },
      defaultVal: ageRangeDefaults,
      divider: <Divider />,
    },
    {
      label: 'Alive',
      value: 'vitalStatus:alive',
      type: 'item',
      check: toggled.vitalStatus?.includes('alive'),
      disabled: areEnrolledOrWithdrawnActive,
    },
    {
      label: 'Deceased',
      value: 'vitalStatus:dead',
      type: 'item',
      check: toggled.vitalStatus?.includes('dead'),
      disabled: areEnrolledOrWithdrawnActive,
      divider: <Divider />,
    },
    {
      label: 'Curation Date',
      value: 'curation',
      type: 'menu',
      check: Boolean(toggled.startCuration || toggled.endCuration),
      disabled: areEnrolledOrWithdrawnActive,
      submenu: (
        <DashboardDateRangeMenu
          anchorElDateRange={anchorElCuration}
          setAnchorElDateRange={setAnchorElCuration}
          date={[toggled.startCuration, toggled.endCuration]}
          setDate={handleSetCuration}
        />
      ),
      setAnchor: (target) => setAnchorElCuration(target),
      defaultVal: {
        type: '',
      },
    },
    {
      label: 'Enrolment Date',
      value: 'enrolment',
      type: 'menu',
      check: Boolean(toggled.startEnrolment || toggled.endEnrolment),
      disabled: areEnrolledOrWithdrawnActive,
      submenu: (
        <DashboardDateRangeMenu
          anchorElDateRange={anchorElEnrolment}
          setAnchorElDateRange={setAnchorElEnrolment}
          date={[toggled.startEnrolment, toggled.endEnrolment]}
          setDate={handleSetEnrolment}
        />
      ),
      setAnchor: (target) => setAnchorElEnrolment(target),
      defaultVal: {
        type: '',
      },
      divider: <Divider />,
    },
    {
      label: 'Study',
      value: 'study',
      type: 'menu',
      check: Boolean(toggled.study?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElStudy}
          setAnchorEl={setAnchorElStudy}
          value={toggled.study || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, study: newValue } : prev
          ))}
          menuOptionsFetch={fetchStudies}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElStudy(target),
      chipLabel: () => getChipLabel(toggled.study || []),
    },
    {
      label: 'Event',
      value: 'eventType',
      type: 'menu',
      check: Boolean(toggled.eventType?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElEvent}
          setAnchorEl={setAnchorElEvent}
          value={toggled.eventType || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, eventType: newValue } : prev
          ))}
          menuOptions={eventTypes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElEvent(target),
      chipLabel: () => getChipLabel(toggled.eventType || []),
    },
    {
      label: 'Cohort',
      value: 'cohort',
      type: 'menu',
      check: Boolean(toggled.cohort?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElCohort}
          setAnchorEl={setAnchorElCohort}
          value={toggled.cohort || []}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, cohort: newValue } : prev
          ))}
          menuOptions={[...cohorts]}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElCohort(target),
      chipLabel: () => getChipLabel(toggled.cohort || [], 1),
    },
    ...DiagnosisFilterOptions({
      filters: toggled,
      setFilters: setToggled,
      loading,
      disabled: areEnrolledOrWithdrawnActive,
    }),
    {
      label: 'Purity',
      value: 'purity',
      type: 'menu',
      check: Boolean(toggled.purity
        && (
          toggled.purity[0] > purityDefaults[0]
          || toggled.purity[1] < purityDefaults[1]
        )),
      disabled: areEnrolledOrWithdrawnActive,
      submenu: (
        <RangeMenu
          anchorEl={anchorElPurity}
          setAnchorEl={setAnchorElPurity}
          value={toggled.purity || purityDefaults}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, purity: newValue as number[] } : prev
          ))}
          defaultRange={purityDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElPurity(target),
      chipLabel: (): string => {
        const [min, max] = toggled.purity || purityDefaults;
        const [defaultMin, defaultMax] = purityDefaults;
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `< ${max}`;
        }
        return '';
      },
      defaultVal: purityDefaults,
    },
    {
      label: 'Mutation Burden',
      value: 'mutBurden',
      type: 'menu',
      check: Boolean(toggled.mutBurden
        && (
          toggled.mutBurden[0] > mutBurdenDefaults[0]
          || toggled.mutBurden[1] < mutBurdenDefaults[1]
        )),
      disabled: areEnrolledOrWithdrawnActive,
      submenu: (
        <RangeMenu
          anchorEl={anchorElMutBurden}
          setAnchorEl={setAnchorElMutBurden}
          value={toggled.mutBurden || mutBurdenDefaults}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, mutBurden: newValue as number[] } : prev
          ))}
          defaultRange={mutBurdenDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElMutBurden(target),
      chipLabel: (): string => {
        const [min, max] = toggled.mutBurden || mutBurdenDefaults;
        const [defaultMin, defaultMax] = mutBurdenDefaults;
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `< ${max}`;
        }
        return '';
      },
      defaultVal: mutBurdenDefaults,
    },
  ];

  return filterOptions;
}
