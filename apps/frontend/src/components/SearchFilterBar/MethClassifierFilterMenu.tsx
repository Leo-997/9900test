import {
  Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX,
} from 'react';
import ListMenu from './ListMenu';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import type { IClassifierVersion } from '@/types/Classifiers.types';

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  onChange: (newList: string[]) => void;
}

export default function MethClassifierFilterMenu({
  anchorEl,
  setAnchorEl,
  onChange,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [classifiers, setClassifiers] = useState<IClassifierVersion[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    zeroDashSdk.methylation.getClassifiers()
      .then((resp) => setClassifiers(resp));
  }, [zeroDashSdk.methylation]);

  const getGroupOptions = useCallback(async (search?: string): Promise<string[]> => (
    classifiers.length
      ? zeroDashSdk.methylation.getClassifierGroups({ search })
        .then((resp) => resp
          .map((g) => {
            const classifier = classifiers.find((c) => c.id === g.methClassifierId);
            const classifierVersion = classifier ? `${classifier.description} version ${classifier.version}` : 'Unknown classifier';
            return `${g.groupName}:${g.methGroupId}:${classifierVersion}`;
          }))
      : []
  ), [classifiers, zeroDashSdk.methylation]);

  return (
    <ListMenu
      value={selectedGroups}
      onChange={(val): void => {
        setSelectedGroups(val);
        onChange(val.map((v) => v.split(':')[1]));
      }}
      customLabel={(option): string => option.split(':')[0]}
      groupBy={(option): string => option.split(':')[2]}
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      menuOptionsFetch={getGroupOptions}
    />
  );
}
