import { Dispatch, SetStateAction, useState } from 'react';
import {
  fileTypes, platforms, referenceGenomes, sampleTypes,
} from '../../../../constants/options';
import { ISelectOption } from '../../../../types/misc.types';
import { FileSizeUnit, FilterOption, IFileTrackerSearchOptions } from '../../../../types/Search.types';
import { convertFromBytes, convertToBytes } from '../../../../utils/functions/convertBytes';
import ListMenu from '../../../SearchFilterBar/ListMenu';
import RangeMenu from '../../../SearchFilterBar/RangeMenu';

export interface IFileTrackerFilterOptionsProps {
  toggled: IFileTrackerSearchOptions;
  setToggled: Dispatch<SetStateAction<IFileTrackerSearchOptions>>;
  loading: boolean;
}

export default function FileTrackerFilterOptions({
  toggled,
  setToggled,
  loading,
}: IFileTrackerFilterOptionsProps): FilterOption[] {
  const fileSizeDefaults = [0, Infinity] as const;

  const [anchorElFileType, setAnchorElFileType] = useState<null | HTMLElement>(null);
  const [anchorElSampleType, setAnchorElSampleType] = useState<null | HTMLElement>(null);
  const [anchorElReferenceGenome, setAnchorElReferenceGenome] = useState<null | HTMLElement>(null);
  const [anchorElPlatform, setAnchorElPlatform] = useState<null | HTMLElement>(null);
  const [anchorElFileSize, setAnchorElFileSize] = useState<null | HTMLElement>(null);

  const getFileSizeUnitOptions = (): ISelectOption<FileSizeUnit>[] => [
    {
      value: 'KB',
      name: 'KB',
    },
    {
      value: 'MB',
      name: 'MB',
    },
    {
      value: 'GB',
      name: 'GB',
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      label: 'File Type',
      value: 'fileType',
      type: 'menu',
      check: toggled.fileType && toggled.fileType.length > 0,
      submenu: (
        <ListMenu
          anchorEl={anchorElFileType}
          setAnchorEl={setAnchorElFileType}
          value={toggled.fileType}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, fileType: newValue } : prev
          ))}
          menuOptions={fileTypes}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElFileType(target),
      chipLabel: () => (toggled.fileType.length > 4 ? (
        `${toggled.fileType
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.fileType.length - 4} more`
      ) : (
        toggled.fileType
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
    {
      label: 'Sample Type',
      value: 'sampleType',
      type: 'menu',
      check: toggled.sampleType.length > 0,
      submenu: (
        <ListMenu
          anchorEl={anchorElSampleType}
          setAnchorEl={setAnchorElSampleType}
          value={toggled.sampleType}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, sampleType: newValue } : prev
          ))}
          menuOptions={sampleTypes}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElSampleType(target),
      chipLabel: () => (toggled.sampleType.length > 4 ? (
        `${toggled.sampleType
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.sampleType.length - 4} more`
      ) : (
        toggled.sampleType
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
    {
      label: 'Reference Genome',
      value: 'refGenome',
      type: 'menu',
      check: toggled.refGenome.length > 0,
      submenu: (
        <ListMenu
          anchorEl={anchorElReferenceGenome}
          setAnchorEl={setAnchorElReferenceGenome}
          value={toggled.refGenome}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, refGenome: newValue } : prev
          ))}
          menuOptions={referenceGenomes}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElReferenceGenome(target),
      chipLabel: () => (toggled.refGenome.length > 4 ? (
        `${toggled.refGenome
          .slice(0, 4)
          .map((g) => g.toUpperCase())
          .join('; ')} + ${toggled.refGenome.length - 4} more`
      ) : (
        toggled.refGenome
          .map((g) => g.toUpperCase())
          .join('; ')
      )),
    },
    {
      label: 'Platform',
      value: 'platform',
      type: 'menu',
      check: toggled.platform.length > 0,
      submenu: (
        <ListMenu
          anchorEl={anchorElPlatform}
          setAnchorEl={setAnchorElPlatform}
          value={toggled.platform}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, platform: newValue } : prev
          ))}
          menuOptions={platforms}
          loading={loading}
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
      label: 'File Size',
      value: 'fileSize',
      type: 'menu',
      check: Boolean(toggled.fileSize
        && (
          toggled.fileSize.min > fileSizeDefaults[0]
          || toggled.fileSize.max < fileSizeDefaults[1]
        )),
      submenu: (
        <RangeMenu
          anchorEl={anchorElFileSize}
          setAnchorEl={setAnchorElFileSize}
          value={toggled.fileSize ? [toggled.fileSize.min, toggled.fileSize.max] : fileSizeDefaults}
          onChange={(newValue): void => setToggled((prev) => (
            prev
              ? {
                ...prev,
                fileSize: {
                  min: newValue[0],
                  max: newValue[1],
                  defaults: [...fileSizeDefaults],
                },
              } : prev
          ))}
          defaultRange={fileSizeDefaults}
          loading={loading}
          getUnitOptions={getFileSizeUnitOptions}
          convertFromUnit={convertFromBytes}
          convertToUnit={convertToBytes}
        />
      ),
      setAnchor: (target) => setAnchorElFileSize(target),
      chipLabel: (): string => {
        const units: FileSizeUnit[] = ['KB', 'MB', 'GB'];
        const defaultMin = toggled.fileSize.defaults[0];
        const defaultMax = toggled.fileSize.defaults[1];
        if (toggled.fileSize.min === 0 && toggled.fileSize.max === Infinity) return '';
        for (const unit of units) {
          const min = convertFromBytes(toggled.fileSize.min, unit);
          const max = convertFromBytes(toggled.fileSize.max, unit);
          if (min > defaultMin && max < defaultMax && (min < 1000 || unit === 'GB')) {
            return `${min} - ${max} ${unit}`;
          } if (min > defaultMin && (min < 1000 || unit === 'GB')) {
            return `${min} ${unit} +`;
          } if (max < 1000 || unit === 'GB') {
            return `< ${max} ${unit}`;
          }
        }
        return '';
      },
      defaultVal: { min: 0, max: Infinity, defaults: [0, Infinity] },
    },
  ];

  return filterOptions;
}
