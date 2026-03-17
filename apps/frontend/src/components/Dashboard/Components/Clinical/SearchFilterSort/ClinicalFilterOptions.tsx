import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { Divider } from '@mui/material';
import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useState,
} from 'react';
import { clinicalStatuses } from '../../../../../constants/MTB/navigation';
import { eventTypes } from '../../../../../constants/options';
import { DateRange, FilterOption, IClinicalDashboardSearchOptions } from '../../../../../types/Search.types';
import ListMenu from '../../../../SearchFilterBar/ListMenu';
import RangeMenu from '../../../../SearchFilterBar/RangeMenu';
import Gender from '../../../../VitalStatus/Gender';
import DashboardDateRangeMenu from '../../Common/SearchFilterSort/DashboardDateRangeMenu';
import DashboardUsersMenu from '../../Common/SearchFilterSort/DashboardUsersMenu';

export interface IDashboardFilterOptionsProps {
  toggled: IClinicalDashboardSearchOptions;
  setToggled: Dispatch<SetStateAction<IClinicalDashboardSearchOptions>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function DashboardFilterOptions({
  toggled,
  setToggled,
  loading,
  setLoading,
}: IDashboardFilterOptionsProps): FilterOption[] {
  const zeroDashSdk = useZeroDashSdk();

  const ageRangeDefaults = [0, 21] as const;

  const [anchorElAgeRange, setAnchorElAgeRange] = useState<null | HTMLElement>(null);
  const [anchorElEvent, setAnchorElEvent] = useState<null | HTMLElement>(null);
  const [anchorElMTB, setAnchorElMTB] = useState<null | HTMLElement>(null);
  const [anchorElEnrolment, setAnchorElEnrolment] = useState<null | HTMLElement>(null);
  const [anchorElClinicalStatus, setAnchorElClinicalStatus] = useState<null | HTMLElement>(null);
  const [anchorElAssignedTo, setAnchorElAssignedTo] = useState<null | HTMLElement>(null);
  const [
    anchorElZero2FinalDiagnosis, setAnchorElZero2FinalDiagnosis,
  ] = useState<null | HTMLElement>(null);

  const handleSetMTB = (dateRange: DateRange): void => {
    const format = 'YYYY-MM-DD H:mm:ss';
    const newDateRange = {
      type: dateRange.type,
      startDate: dateRange.startDate
        ? dayjs(dateRange.startDate).startOf('day').format(format).toString()
        : '',
      endDate: dateRange.endDate
        ? dayjs(dateRange.endDate).endOf('day').format(format).toString()
        : '',
    };
    setToggled({
      ...toggled,
      startMtb: newDateRange.startDate,
      endMtb: newDateRange.endDate,
    });
  };

  const handleSetEnrolment = (dateRange: DateRange): void => {
    const format = 'YYYY-MM-DD H:mm:ss';
    const newDateRange = {
      type: dateRange.type,
      startDate: dateRange.startDate
        ? dayjs(dateRange.startDate).startOf('day').format(format).toString()
        : '',
      endDate: dateRange.endDate
        ? dayjs(dateRange.endDate).endOf('day').format(format).toString()
        : '',
    };
    setToggled({
      ...toggled,
      startEnrolment: newDateRange.startDate,
      endEnrolment: newDateRange.endDate,
    });
  };

  const filterOptions: FilterOption[] = [
    {
      label: 'Expedited only',
      value: 'expedited',
      type: 'item',
      check: Boolean(toggled.expedited),
      divider: <Divider />,
    },
    {
      label: 'Female',
      value: 'gender:female',
      type: 'item',
      check: toggled.gender.includes('female'),
      icon: <Gender vitalStatus="Dead" gender="Female" />,
    },
    {
      label: 'Male',
      value: 'gender:male',
      type: 'item',
      check: toggled.gender.includes('male'),
      icon: <Gender vitalStatus="Dead" gender="Male" />,
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
      defaultVal: { min: 0, max: 21, defaults: [0, 21] },
      divider: <Divider />,
    },
    {
      label: 'Event',
      value: 'eventType',
      type: 'menu',
      check: Boolean(toggled.eventType.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElEvent}
          setAnchorEl={setAnchorElEvent}
          value={toggled.eventType}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, eventType: newValue } : prev
          ))}
          menuOptions={eventTypes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElEvent(target),
      chipLabel: () => (toggled.eventType.length > 4 ? (
        `${toggled.eventType
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.eventType.length - 4} more`
      ) : (
        toggled.eventType
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'Alive',
      value: 'vitalStatus:alive',
      type: 'item',
      check: toggled.vitalStatus.includes('alive'),
    },
    {
      label: 'Deceased',
      value: 'vitalStatus:dead',
      type: 'item',
      check: toggled.vitalStatus.includes('dead'),
      divider: <Divider />,
    },
    {
      label: 'Assigned to',
      value: 'assignees',
      type: 'menu',
      check: Boolean(toggled.assignees.length > 0),
      submenu: (
        <DashboardUsersMenu
          anchorElUsers={anchorElAssignedTo}
          setAnchorElUsers={setAnchorElAssignedTo}
          toggled={toggled}
          setToggled={setToggled}
          loading={loading}
          type="Clinical"
        />
      ),
      setAnchor: (target) => setAnchorElAssignedTo(target),
      chipLabel: () => (toggled.assignees.length > 4 ? (
        `${toggled.assignees
          .slice(0, 4)
          .map((c) => c.split('::')[0])
          .join('; ')} + ${toggled.assignees.length - 4} more`
      ) : (
        toggled.assignees
          .map((c) => c.split('::')[0])
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'MTB Meeting Date',
      value: 'mtb',
      type: 'menu',
      check: Boolean(toggled.startMtb || toggled.endMtb),
      submenu: (
        <DashboardDateRangeMenu
          anchorElDateRange={anchorElMTB}
          setAnchorElDateRange={setAnchorElMTB}
          date={[toggled.startMtb, toggled.endMtb]}
          setDate={handleSetMTB}
        />
      ),
      setAnchor: (target) => setAnchorElMTB(target),
      defaultVal: {
        type: '',
      },
    },
    {
      label: 'Enrolment Date',
      value: 'enrolment',
      type: 'menu',
      check: Boolean(toggled.startEnrolment || toggled.endEnrolment),
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
      label: 'Clinical Status',
      value: 'clinicalStatus',
      type: 'menu',
      check: Boolean(toggled.clinicalStatus.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElClinicalStatus}
          setAnchorEl={setAnchorElClinicalStatus}
          value={toggled.clinicalStatus}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, clinicalStatus: newValue } : prev
          ))}
          menuOptions={Object.keys(clinicalStatuses)}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElClinicalStatus(target),
      chipLabel: () => (toggled.clinicalStatus.length > 1 ? (
        `${toggled.clinicalStatus
          .slice(0, 1)
          .join('; ')} + ${
          toggled.clinicalStatus.length - 1
        } more`
      ) : (
        toggled.clinicalStatus
          .join('; ')
      )),
    },
    {
      label: 'Zero2 Final Diagnosis',
      value: 'zero2FinalDiagnosis',
      type: 'menu',
      check: Boolean(toggled.zero2FinalDiagnosis.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElZero2FinalDiagnosis}
          setAnchorEl={setAnchorElZero2FinalDiagnosis}
          value={toggled.zero2FinalDiagnosis}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, zero2FinalDiagnosis: newValue } : prev
          ))}
          menuOptionsFetch={
            (): Promise<string[]> => zeroDashSdk
              .curation
              .analysisSets
              .getZero2FinalDiagnosis()
          }
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElZero2FinalDiagnosis(target),
      chipLabel: () => (toggled.zero2FinalDiagnosis.length > 4 ? (
        `${toggled.zero2FinalDiagnosis
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.zero2FinalDiagnosis.length - 4} more`
      ) : (
        toggled.zero2FinalDiagnosis
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
  ];

  return filterOptions;
}
