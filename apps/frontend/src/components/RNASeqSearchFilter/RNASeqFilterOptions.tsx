import useMatchGenesToList from '@/hooks/useMatchGenesToList';
import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { chromosomes } from '../../constants/options';
import { FilterOption, IRNASeqSearchOptions } from '../../types/Search.types';
import CustomGeneList from '../GeneFilter/CustomGeneList';
import ListMenu from '../SearchFilterBar/ListMenu';
import RangeMenu from '../SearchFilterBar/RangeMenu';

export interface IRNASeqFilterOptionsProps {
  toggled: IRNASeqSearchOptions;
  setToggled: Dispatch<SetStateAction<IRNASeqSearchOptions>>;
  emptyOptions: IRNASeqSearchOptions;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function RNASeqFilterOptions({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  setLoading,
}: IRNASeqFilterOptionsProps): FilterOption[] {
  const getMatchingList = useMatchGenesToList(toggled.genename);

  const foldChangeDefaults = [-Infinity, Infinity];
  const zScoreDefaults = [-Infinity, Infinity];
  const tpmDefaults = [-Infinity, Infinity];
  const fpkmDefaults = [-Infinity, Infinity];

  const [anchorElGeneName, setAnchorElGeneName] = useState<null | HTMLElement>(null);
  const [anchorElChromosome, setAnchorElChromosome] = useState<null | HTMLElement>(null);
  const [anchorElGeneExpression, setAnchorElGeneExpression] = useState<null | HTMLElement>(null);
  const [anchorElFoldChange, setAnchorElFoldChange] = useState<null | HTMLElement>(null);
  const [anchorElZScore, setAnchorElZScore] = useState<null | HTMLElement>(null);
  const [anchorElTPM, setAnchorElTPM] = useState<null | HTMLElement>(null);
  const [anchorElFPKM, setAnchorElFPKM] = useState<null | HTMLElement>(null);

  const filterOptions: FilterOption[] = [
    {
      label: 'Chromosome',
      value: 'chromosome',
      type: 'menu',
      check: Boolean(toggled.chromosome.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElChromosome}
          setAnchorEl={setAnchorElChromosome}
          value={toggled.chromosome}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, chromosome: newValue } : prev
          ))}
          menuOptions={chromosomes}
          customLabel={(chr: string): string => `Chr ${chr}`}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElChromosome(target),
      chipLabel: () => (toggled.chromosome.length > 4 ? (
        `${toggled.chromosome
          .slice(0, 4)
          .map((g) => `Chr ${g}`)
          .join('; ')} + ${toggled.chromosome.length - 4} more`
      ) : (
        toggled.chromosome
          .map((g) => `Chr ${g}`)
          .join('; ')
      )),
    },
    {
      label: 'Genes',
      value: 'genename',
      type: 'menu',
      check: Boolean(toggled.genename.length > 0),
      submenu: (
        <CustomGeneList
          anchorElGeneList={anchorElGeneName}
          setAnchorElGeneList={setAnchorElGeneName}
          defaultValue={toggled.genename}
          onChange={
            (newList): void => setToggled(
              (prev) => ({ ...(prev || emptyOptions), genename: newList }),
            )
          }
        />
      ),
      setAnchor: (target) => setAnchorElGeneName(target),
      chipLabel: getMatchingList,
    },
    {
      label: 'Gene Expression',
      value: 'geneExpression',
      type: 'menu',
      check: Boolean(toggled.geneExpression.length > 0),
      submenu: (
        <ListMenu
          anchorEl={anchorElGeneExpression}
          setAnchorEl={setAnchorElGeneExpression}
          value={toggled.geneExpression}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? { ...prev, geneExpression: newValue } : prev
          ))}
          menuOptions={['High', 'Medium', 'Low', 'None', 'Unknown']}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElGeneExpression(target),
      chipLabel: () => (toggled.geneExpression.length > 4 ? (
        `${toggled.geneExpression
          .slice(0, 4)
          .map((g) => `${g}`)
          .join('; ')} + ${toggled.geneExpression.length - 4} more`
      ) : (
        toggled.geneExpression
          .map((g) => `${g}`)
          .join('; ')
      )),
      divider: <Divider />,
    },
    {
      label: 'Fold Change',
      value: 'foldChange',
      type: 'menu',
      check: toggled.foldChange.min > toggled.foldChange.defaults[0]
               || toggled.foldChange.max < toggled.foldChange.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElFoldChange}
          setAnchorEl={setAnchorElFoldChange}
          value={[toggled.foldChange.min, toggled.foldChange.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? {
              ...prev,
              foldChange: {
                min: newValue[0],
                max: newValue[1],
                defaults: foldChangeDefaults,
              },
            } : prev
          ))}
          defaultRange={foldChangeDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElFoldChange(target),
      chipLabel: (): string => {
        const { min } = toggled.foldChange;
        const { max } = toggled.foldChange;
        const defaultMin = toggled.foldChange.defaults[0];
        const defaultMax = toggled.foldChange.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `up to ${max}`;
        }
        return '';
      },
      defaultVal: {
        min: -Infinity,
        max: Infinity,
        defaults: [-Infinity, Infinity],
      },
    },
    {
      label: 'z-score',
      value: 'zScore',
      type: 'menu',
      check: toggled.zScore.min > toggled.zScore.defaults[0]
               || toggled.zScore.max < toggled.zScore.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElZScore}
          setAnchorEl={setAnchorElZScore}
          value={[toggled.zScore.min, toggled.zScore.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? {
              ...prev,
              zScore: {
                min: newValue[0],
                max: newValue[1],
                defaults: zScoreDefaults,
              },
            } : prev
          ))}
          defaultRange={zScoreDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElZScore(target),
      chipLabel: (): string => {
        const { min } = toggled.zScore;
        const { max } = toggled.zScore;
        const defaultMin = toggled.zScore.defaults[0];
        const defaultMax = toggled.zScore.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `up to ${max}`;
        }
        return '';
      },
      defaultVal: {
        min: -Infinity,
        max: Infinity,
        defaults: [-Infinity, Infinity],
      },
    },
    {
      label: 'TPM',
      value: 'tpm',
      type: 'menu',
      check: toggled.tpm.min > toggled.tpm.defaults[0]
               || toggled.tpm.max < toggled.tpm.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElTPM}
          setAnchorEl={setAnchorElTPM}
          value={[toggled.tpm.min, toggled.tpm.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? {
              ...prev,
              tpm: {
                min: newValue[0],
                max: newValue[1],
                defaults: tpmDefaults,
              },
            } : prev
          ))}
          defaultRange={tpmDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElTPM(target),
      chipLabel: (): string => {
        const { min } = toggled.tpm;
        const { max } = toggled.tpm;
        const defaultMin = toggled.tpm.defaults[0];
        const defaultMax = toggled.tpm.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `up to ${max}`;
        }
        return '';
      },
      defaultVal: {
        min: -Infinity,
        max: Infinity,
        defaults: [-Infinity, Infinity],
      },
    },
    {
      label: 'FPKM',
      value: 'fpkm',
      type: 'menu',
      check: toggled.fpkm.min > toggled.fpkm.defaults[0]
               || toggled.fpkm.max < toggled.fpkm.defaults[1],
      submenu: (
        <RangeMenu
          anchorEl={anchorElFPKM}
          setAnchorEl={setAnchorElFPKM}
          value={[toggled.fpkm.min, toggled.fpkm.max]}
          onChange={(newValue): void => setToggled((prev) => (
            prev ? {
              ...prev,
              fpkm: {
                min: newValue[0],
                max: newValue[1],
                defaults: fpkmDefaults,
              },
            } : prev
          ))}
          defaultRange={fpkmDefaults}
          loading={loading}
        />
      ),
      setAnchor: (target) => setAnchorElFPKM(target),
      chipLabel: (): string => {
        const { min } = toggled.fpkm;
        const { max } = toggled.fpkm;
        const defaultMin = toggled.fpkm.defaults[0];
        const defaultMax = toggled.fpkm.defaults[1];
        if (min > defaultMin && max < defaultMax) {
          return `${min} - ${max}`;
        } if (min > defaultMin) {
          return `${min} +`;
        } if (max < defaultMax) {
          return `up to ${max}`;
        }
        return '';
      },
      defaultVal: {
        min: -Infinity,
        max: Infinity,
        defaults: [-Infinity, Infinity],
      },
      divider: <Divider />,
    },
    {
      label: 'Reportable',
      value: 'reportable',
      type: 'item',
      check: Boolean(toggled.reportable),
    },
  ];

  return filterOptions;
}
