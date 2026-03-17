import { Table, TableBody } from '@mui/material';
import { IMolAltSummaryColumn, IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { IUpdateOrder } from '@/types/Common.types';
import { IGeneAltSettings, INonGeneAltSettings } from '@/types/MTB/Settings.types';
import { AlterationSummaryTableHeader } from './AlterationSummaryTableHeader';
import AlterationDropRow from './AlterationDropRow';
import { AlterationSummaryListItem } from './AlterationSummaryListItem';

interface IProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  itemType: string;
  frequencyUnits?: string;
  isPresentationMode?: boolean;
  canEdit?: boolean;
  defaultColumnSettings: IMolAltSummaryColumn<T>[];
  visibilitySettings: T | undefined;
  alterations: IMolecularAlterationDetail[];
  updateOrder: (order: IUpdateOrder[]) => Promise<void>;
  getMolAlterationSummary: () => Promise<void>;
  isForNonGeneType?: boolean;
  onToggleColumn: (
    settingsKey: keyof T,
    checked: boolean,
  ) => Promise<void>;
}

export default function AlterationsTable<T extends IGeneAltSettings | INonGeneAltSettings>({
  itemType,
  frequencyUnits,
  isPresentationMode,
  canEdit,
  defaultColumnSettings,
  visibilitySettings,
  alterations,
  updateOrder,
  getMolAlterationSummary,
  isForNonGeneType,
  onToggleColumn,
}: IProps<T>): JSX.Element {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const columnSettings = useMemo<IMolAltSummaryColumn<T>[]>(
    () => defaultColumnSettings.map((columnSetting) => ({
      ...columnSetting,
      visible: visibilitySettings?.[columnSetting.settingsKey] as boolean ?? columnSetting.visible,
    })),
    [defaultColumnSettings, visibilitySettings],
  );

  const handleDrop = useCallback((
    alts: IMolecularAlterationDetail[],
    alterationToMove: IMolecularAlterationDetail,
    placeAfter: IMolecularAlterationDetail | null,
  ): void => {
    const newList = [...alts];
    const alterationIndex = alts.findIndex((a) => a.id === alterationToMove.id);
    const newPrecedingIndex = placeAfter
      ? alts.findIndex((a) => a.id === placeAfter.id)
      : -1;
    const newIndex = newPrecedingIndex + 1;
    if (alterationIndex > -1 && alterationIndex !== newIndex) {
      newList.splice(alterationIndex, 1);
      if (newIndex > alterationIndex) {
        newList.splice(newIndex - 1, 0, alterationToMove);
      } else {
        newList.splice(newIndex, 0, alterationToMove);
      }
      updateOrder(newList.map((a, index) => ({
        id: a.id,
        order: index,
      })));
    }
  }, [updateOrder]);

  return (
    <Table style={{ width: '100%' }}>
      <AlterationSummaryTableHeader
        frequencyUnits={frequencyUnits}
        canEdit={canEdit}
        isPresentationMode={isPresentationMode}
        columnSettings={columnSettings}
        onToggleColumn={onToggleColumn}
        isForNonGeneType={isForNonGeneType}
      />
      <TableBody>
        <AlterationDropRow
          key="first"
          columnSettings={columnSettings}
          itemType={itemType}
          isAnyDragging={isDragging}
          onDrop={(item): void => handleDrop(alterations, item, null)}
        />
        {alterations
          .filter((a) => !isPresentationMode || !a.hidden)
          .flatMap((a) => ([
            <AlterationSummaryListItem
              key={a.id}
              itemType={itemType}
              data={a}
              onDataChange={getMolAlterationSummary}
              setIsAnyDragging={setIsDragging}
              summarySettingMapper={columnSettings}
              canEdit={canEdit}
              isPresentationMode={isPresentationMode}
              isForNonGeneType={a.mutationType.includes('CYTO') || isForNonGeneType}
            />,
            <AlterationDropRow
              key={`drop-${a.id}`}
              columnSettings={columnSettings}
              itemType={itemType}
              isAnyDragging={isDragging}
              onDrop={(item): void => handleDrop(alterations, item, a)}
            />,
          ]))}
      </TableBody>
    </Table>
  );
}
