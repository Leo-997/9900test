import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';

import { makeStyles } from '@mui/styles';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { IDrugScreen } from '@/types/Drugs/Screen.types';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import { toFixed } from '@/utils/math/toFixed';
import { htsColumnNames } from '../../constants/htsColumnNames';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import {
  HTSResultSummary, IDetailedHTSDrugCombination, IDetailedHTSResult, IHTSCulture, IHTSCulturePlots,
  IHTSReportable,
  IUpdateHTSCultureBody,
} from '../../types/HTS.types';
import { IHTSSearchOptions } from '../../types/Search.types';
import getVariantId from '../../utils/functions/getVariantId';
import LoadingAnimation from '../Animations/LoadingAnimation';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import AddCombinationModal from '../HTS/AddCombinationModal';
import { HTSCombinationListItem } from '../HTS/HTSCombinationListItem';
import HTSCulturePanel from '../HTS/HTSCulturePanel';
import HTSModalContent from '../HTS/HTSModalContent';
import HTSPlotsPanel from '../HTS/HTSPlotsPanel';
import HTSResultItem from '../HTS/HTSResultItem';
import HTSSearchFilterBar from '../HTS/HTSSearchFilterBar';
import { HtsFooter } from '../HTS/HtsFooter';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import TabContentWrapper from './TabContentWrapper';

const useStyles = makeStyles(() => ({
  wrapper: {
    maxHeight: 'calc(100vh - 160px)',
    width: '100%',
  },
  hitChipTitle: {
    marginLeft: 4,
  },
  tabContentWrapper: {
    maxHeight: 'fit-content',
    overflowY: 'visible',
  },
}));

const emptySummary: HTSResultSummary = {
  aucZScore: { min: 0, max: 0, mid: 0 },
  ic50ZScore: { min: 0, max: 0, mid: 0 },
  lc50ZScore: { min: 0, max: 0, mid: 0 },
};

const emptyOptions: IHTSSearchOptions = {
  search: '',
};

export type HTSTabView = 'Drugs' | 'Drug Combination';

export default function HTSTabContent(): JSX.Element {
  const classes = useStyles();
  const { search } = useLocation();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { htsBiosamples, htsCultures, onCultureChange } = useAnalysisSet();

  const [
    selectedBiosample,
    setSelectedBiosample,
  ] = useState<IBiosample | undefined>();
  const [selectedCulture, setSelectedCulture] = useState<IHTSCulture>();
  const [screens, setScreens] = useState<IDrugScreen[]>();
  const [culturePlots, setCulturePlots] = useState<IHTSCulturePlots>();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [notifItem, setNotifItem] = useState<IDetailedHTSResult>();
  const [zScoreSummary, setZscoreSummary] = useState<HTSResultSummary>(emptySummary);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [toggled, setToggled] = useState<IHTSSearchOptions>(emptyOptions);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<HTSTabView>('Drugs');
  const [combinations, setCombinations] = useState<IDetailedHTSDrugCombination[]>([]);

  const getSearchedScreens = useCallback(() => {
    if (screens) {
      let searchedScreens = [...screens];
      if (toggled?.search) {
        searchedScreens = searchedScreens.filter(
          (s) => s.drugName.toLowerCase().includes(toggled?.search?.toLocaleLowerCase() || ''),
        );
      }

      if (toggled?.targets) {
        searchedScreens = searchedScreens.filter(
          (s) => s
            .targets
            .map((t) => t.id)
            .some((id) => (
              toggled
                .targets
                ?.map((t) => t.split('::')[1])
                .includes(id)
            )),
        );
      }

      if (toggled?.pathways) {
        searchedScreens = searchedScreens.filter(
          (s) => s
            .classes
            .map((t) => t.id)
            .some((id) => (
              toggled
                .pathways
                ?.map((t) => t.split('::')[1])
                .includes(id)
            )),
        );
      }
      return searchedScreens;
    }
    return [];
  }, [screens, toggled?.pathways, toggled?.search, toggled?.targets]);

  const getHtsData = useCallback(async () => {
    if (selectedBiosample?.biosampleId) {
      try {
        const plots = await zeroDashSdk.plots.getHTSCulturePlots(
          selectedBiosample.biosampleId,
        );
        setCulturePlots(plots);
      } catch (error) {
        enqueueSnackbar('Unable to fetch HTS culture data', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, selectedBiosample?.biosampleId, zeroDashSdk.plots]);

  const getCounts = useCallback(async (): Promise<number> => {
    if (selectedBiosample?.biosampleId && selectedCulture) {
      const searchedScreens = getSearchedScreens();

      if (toggled?.search && searchedScreens.length === 0) {
        return 0;
      }

      const countResp = await zeroDashSdk.hts.getHTSResultsCount(
        selectedBiosample.biosampleId,
        {
          screenIds: (toggled?.search || selectedCulture?.screenName)
            ? searchedScreens.map((screen) => screen.id)
            : [],
        },
      );
      return countResp;
    }
    return 0;
  }, [
    getSearchedScreens,
    selectedBiosample?.biosampleId,
    selectedCulture,
    toggled?.search,
    zeroDashSdk.hts,
  ]);

  const fetchHtsResults = useCallback(
    async (page: number, limit: number): Promise<IDetailedHTSResult[]> => {
      if (selectedBiosample?.biosampleId && selectedCulture && screens) {
        setLoading(true);
        const searchedScreens = getSearchedScreens();

        if (toggled?.search && searchedScreens.length === 0) {
          setLoading(false);
          return [];
        }

        const htsResultsData = await zeroDashSdk.hts.getHTSResults(
          selectedBiosample.biosampleId,
          {
            screenIds: (toggled?.search || selectedCulture?.screenName)
              ? searchedScreens.map((screen) => screen.id)
              : [],
            sortColumns: toggled.sortColumns,
            sortDirections: toggled.sortDirections,
          },
          page,
          limit,
        );

        setLoading(false);
        return htsResultsData.map((result) => {
          const screen = screens.find((s) => s.id === result.screenId);
          return {
            ...result,
            compoundId: screen?.internalId,
            drugId: result.screenId,
            drugName: screen?.drugName,
            classes: screen?.classes,
            targets: screen?.targets,
          };
        });
      }

      setLoading(false);
      return [];
    },
    [
      getSearchedScreens,
      screens,
      selectedBiosample?.biosampleId,
      selectedCulture,
      toggled?.search,
      toggled.sortColumns,
      toggled.sortDirections,
      zeroDashSdk.hts,
    ],
  );

  useEffect(() => {
    const getDefaultBiosample = async (): Promise<void> => {
      if (htsBiosamples?.length && !selectedBiosample && !selectedCulture) {
        try {
          const successfulScreenCulture = htsCultures?.find((c) => c.screenStatus === 'PASS');
          // There is only one biosample
          if (htsBiosamples.length === 1) {
            setSelectedBiosample(htsBiosamples[0]);
            // Default to first culture with "PASS" htsCulture
            setSelectedCulture(
              successfulScreenCulture
              || htsCultures?.find(
                (c) => c.biosampleId === htsBiosamples[0].biosampleId,
              ),
            );
            return;
          }

          // There are multiple biosamples
          // default to first HTS biosample found with "PASS" htsCulture
          const successfulScreenBiosample = htsBiosamples.find(
            (biosample) => biosample.biosampleId === successfulScreenCulture?.biosampleId,
          );
          if (successfulScreenBiosample) {
            setSelectedBiosample(successfulScreenBiosample);
            setSelectedCulture(successfulScreenCulture);
            return;
          }
        } catch {
          enqueueSnackbar('Unable to set default HTS biosample, set first biosample instead.', { variant: 'error' });
        }

        // There are multiple biosamples and no successfull screen
        // Default to first biosample and its first-found culture
        setSelectedBiosample(htsBiosamples[0]);
        setSelectedCulture(htsCultures?.find(
          (c) => c.biosampleId === htsBiosamples[0].biosampleId,
        ));
      }
    };

    getDefaultBiosample();
  }, [
    enqueueSnackbar,
    htsBiosamples,
    htsCultures,
    selectedBiosample,
    selectedCulture,
  ]);

  useEffect(() => {
    async function getNotifItem(): Promise<void> {
      const variantId = getVariantId(search);
      if (variantId && selectedBiosample?.biosampleId && screens) {
        const drugId = variantId;
        const data = await zeroDashSdk.hts.getHTSResultById(
          selectedBiosample.biosampleId,
          drugId,
        );
        const summary = await zeroDashSdk.hts.getZScoreSummary(
          selectedBiosample.biosampleId,
        );
        const screen = screens.find((s) => s.id === data.screenId);
        setNotifItem({
          ...data,
          compoundId: screen?.internalId,
          drugId: screen?.drugId || data.screenId,
          drugName: screen?.drugName,
          classes: screen?.classes,
          targets: screen?.targets,
        });
        setZscoreSummary(summary);
        setExpanded(true);
      }
    }
    getNotifItem();
  }, [screens, search, selectedBiosample?.biosampleId, zeroDashSdk.hts]);

  useEffect(() => {
    if (selectedCulture?.screenName) {
      zeroDashSdk.services.drugs.getDrugScreens({
        screenName: selectedCulture.screenName,
      }).then(setScreens);
    }
  }, [selectedCulture?.screenName, zeroDashSdk.services.drugs]);

  useEffect(() => {
    async function getTotalCount(): Promise<void> {
      const tempCount = await getCounts();
      setTotalCount(tempCount);
    }
    getTotalCount();
  }, [getCounts]);

  useEffect(() => {
    getHtsData();
  }, [selectedBiosample?.biosampleId, getHtsData, zeroDashSdk.hts]);

  useEffect(() => {
    async function getHtsResultSummary(): Promise<void> {
      if (selectedBiosample?.biosampleId) {
        const resp = await zeroDashSdk.hts.getZScoreSummary(
          selectedBiosample.biosampleId,
        );
        setZscoreSummary(resp);
      }
    }
    getHtsResultSummary();
  }, [selectedBiosample?.biosampleId, zeroDashSdk.hts]);

  const updateResult = async (body: Partial<IHTSReportable>): Promise<void> => {
    if (selectedBiosample?.biosampleId && notifItem?.screenId) {
      await zeroDashSdk.hts.updateHtsResultById(
        body,
        selectedBiosample.biosampleId,
        notifItem.screenId,
      );
      setNotifItem({ ...notifItem, ...body } as IDetailedHTSResult);
    }
  };

  const updateCulture = async (body: IUpdateHTSCultureBody): Promise<void> => {
    if (selectedBiosample?.biosampleId && selectedCulture?.screenName) {
      await zeroDashSdk.hts.updateHtsCulture(
        selectedBiosample?.biosampleId,
        selectedCulture?.screenName,
        body,
      );
      setSelectedCulture({ ...selectedCulture, ...body });
      if (onCultureChange) {
        onCultureChange(
          selectedBiosample.biosampleId,
          selectedCulture.screenName,
          { ...selectedCulture, ...body },
        );
      }
    }
  };

  const exportData = async (): Promise<void> => {
    const data: IDetailedHTSResult[] = [];
    const limit = 10;

    const countRecords = await getCounts();
    const numOfPages = Math.ceil(countRecords / limit);
    const promises: Promise<number | void>[] = [];

    for (let page = 1; page <= numOfPages; page += 1) {
      promises.push(
        fetchHtsResults(
          page,
          limit,
        )
          .then(
            (resp) => data.push(...resp),
          ),
      );
    }

    await Promise.all(promises);
    const lines: string[][] = [
      Object.values(htsColumnNames),
      Object.keys(htsColumnNames).map((key) => {
        if (key === 'biosampleId') return selectedBiosample?.biosampleId || '-';
        if (key === 'drugName') return 'Control';
        if (key === 'changeRatio') {
          return selectedCulture?.controlChangeRatio === null
            || selectedCulture?.controlChangeRatio === undefined
            ? '-'
            : toFixed(selectedCulture?.controlChangeRatio, 1);
        }

        return '-';
      }),
    ];
    for (const result of data) {
      const line: string[] = [];
      for (const key of Object.keys(htsColumnNames)) {
        if (typeof result[key] === 'string') {
          line.push(result[key]);
        } else if (Array.isArray(result[key])) {
          line.push(result[key].map((value) => value.name).join('; '));
        } else {
          line.push(result[key]);
        }
      }
      lines.push(line);
    }

    const csvContent = `data:text/tsv;charset=utf-8,${
      lines.map((e) => e.join('\t')).join('\n')
    }`;
    const encodedUri = encodeURI(csvContent);

    const a = document.createElement('a');
    a.href = encodedUri;
    a.target = '_blank';
    a.download = `${selectedBiosample?.biosampleId} Drug Results.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const mapping = (
    htsResult: IDetailedHTSResult,
    key: number,
    updateHTS?: (data: IDetailedHTSResult) => void,
  ): ReactNode => (
    <HTSResultItem
      key={key}
      data={htsResult}
      zScoreSummary={zScoreSummary}
      updateHTS={updateHTS}
    />
  );

  const getCombinations = useCallback(async () => {
    if (view === 'Drug Combination' && selectedBiosample?.biosampleId && screens) {
      const searchedScreens = getSearchedScreens();
      if (searchedScreens.length) {
        zeroDashSdk.hts.getDrugCombinations(
          selectedBiosample.biosampleId,
          {
            screenIds: searchedScreens.length < screens.length
              ? searchedScreens.map((screen) => screen.id)
              : undefined,
          },
        ).then((resp) => resp.map<IDetailedHTSDrugCombination>((combo) => ({
          ...combo,
          screen1Data: screens.find((screen) => screen.id === combo.screenId1),
          screen2Data: screens.find((screen) => screen.id === combo.screenId2),
        })))
          .then(setCombinations);
      }
    } else {
      setCombinations([]);
    }
  }, [
    getSearchedScreens,
    screens,
    selectedBiosample?.biosampleId,
    view,
    zeroDashSdk.hts,
  ]);

  const updateCombination = useCallback((id: string, newBody: Partial<IHTSReportable>) => {
    setCombinations((prev) => prev.map((combo) => ({
      ...combo,
      ...(
        combo.id === id
          ? newBody
          : {}
      ),
    })));
  }, []);

  useEffect(() => {
    getCombinations();
  }, [getCombinations]);

  return (
    <ScrollableSection className={classes.wrapper}>
      {
        selectedBiosample && htsCultures && (
          <>
            <HTSCulturePanel
              hts={selectedCulture}
              cultures={
                htsCultures?.filter((c) => c.biosampleId === selectedBiosample.biosampleId)
              }
              onSelectCulture={setSelectedCulture}
              selectedBiosample={selectedBiosample}
              onSelectBiosample={(biosample): void => {
                const successfulScreenCulture = htsCultures?.find(
                  (c) => c.screenStatus === 'PASS' && biosample.biosampleId === c.biosampleId,
                );
                setSelectedCulture(
                  successfulScreenCulture
                  || htsCultures.find((c) => c.biosampleId === biosample.biosampleId),
                );
                setSelectedBiosample(biosample);
              }}
              onUpdateCulture={updateCulture}
            />
            <HTSPlotsPanel plots={culturePlots} />
            {screens && (
              <HTSSearchFilterBar
                screens={screens}
                toggled={toggled || emptyOptions}
                setToggled={setToggled}
                exportData={exportData}
                emptyOptions={emptyOptions}
                counts={
                  view === 'Drugs'
                    ? { current: count, total: totalCount }
                    : { current: combinations.length, total: combinations.length }
                }
                loading={loading}
                view={view}
                onViewChange={setView}
              />
            )}
          </>
        )
      }
      {loading && (
        <Box margin="200px auto">
          <LoadingAnimation />
        </Box>
      )}
      {view === 'Drugs' && (
        <TabContentWrapper
          updateCount={setCount}
          className={classes.tabContentWrapper}
          fetch={fetchHtsResults}
          mapping={mapping}
        />
      )}
      {view === 'Drug Combination' && screens && (
        combinations.map((combo) => (
          <HTSCombinationListItem
            key={combo.id}
            combination={combo}
            onChange={updateCombination}
          />
        ))
      )}
      {view === 'Drug Combination' && selectedBiosample && selectedCulture && screens && (
        <AddCombinationModal
          biosampleId={selectedBiosample?.biosampleId}
          screens={screens}
          onCreateCombination={getCombinations}
        />
      )}
      {expanded && notifItem && selectedBiosample?.biosampleId && (
        <ExpandedModal
          variantType="HTS"
          variantId={notifItem.drugId}
          biosampleId={selectedBiosample.biosampleId}
          open={expanded}
          handleClose={(): void => setExpanded(false)}
          title="DRUG NAME"
          titleContent={notifItem.drugName}
          curationDataComponent={
            zScoreSummary && (
            <HTSModalContent
              data={notifItem}
              zScoreSummary={zScoreSummary}
              cohortCount={selectedCulture?.wholeCohortCount}
            />
            )
          }
          overrideFooter={(
            <HtsFooter
              variantId={notifItem.screenId}
              variantType="HTS"
              biosampleId={notifItem.biosampleId}
              data={notifItem}
              updateReportable={updateResult}
            />
          )}
          overrideType="hts"
        />
      )}
    </ScrollableSection>
  );
}
