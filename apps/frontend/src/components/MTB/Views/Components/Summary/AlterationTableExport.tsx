import { Table, TableBody } from '@mui/material';
import { IGeneAltSettings, INonGeneAltSettings } from '@/types/MTB/Settings.types';
import { IMolAltSummaryColumn, IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { useMemo, type JSX } from 'react';
import { AlterationSummaryListItemExport } from './AlterationSummaryListItemExport';
import { AlterationSummaryTableHeaderExport } from './AlterationSummaryTableHeaderExport';

interface IProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  defaultColumnSettings: IMolAltSummaryColumn<T>[];
  visibilitySettings: T | undefined;
  alterations: IMolecularAlterationDetail[];
  isForNonGeneType?: boolean;
}

export default function AlterationsTableExport<T extends IGeneAltSettings | INonGeneAltSettings>({
  defaultColumnSettings,
  visibilitySettings,
  alterations,
  isForNonGeneType,
}: IProps<T>): JSX.Element {
  const columnSettings = useMemo<IMolAltSummaryColumn<T>[]>(
    () => defaultColumnSettings.map((columnSetting) => ({
      ...columnSetting,
      visible: visibilitySettings?.[columnSetting.settingsKey] as boolean ?? columnSetting.visible,
    })),
    [defaultColumnSettings, visibilitySettings],
  );

  return (
    <Table
      style={{
        width: '100%',
        maxWidth: '100%',
        tableLayout: 'fixed',
      }}
    >
      <AlterationSummaryTableHeaderExport
        columnSettings={columnSettings}
      />
      <TableBody>
        {alterations
          .filter((a) => !a.hidden)
          .map((a) => ([
            <AlterationSummaryListItemExport
              key={a.id}
              data={a}
              columnSettings={columnSettings}
              isForNonGeneType={a.mutationType.includes('CYTOGENETICS') || isForNonGeneType}
            />,
          ]))}
      </TableBody>
    </Table>
  );
}
