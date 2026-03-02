import { useEffect, useState } from 'react';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IExtendedGene } from '../../../../../types/Common.types';
import { ISelectOption } from '../../../../../types/misc.types';
import LoadingAnimation from '../../../../Animations/LoadingAnimation';
import CustomTypography from '../../../../Common/Typography';
import { MultiSwitch } from '../../../../MultiSwitch/MultiSwitch';
import { ResourcesGeneTabContent } from './Content';

interface IProps {
  geneIds?: ISelectOption<number>[];
  isTabExpanded?: boolean;
}

export function ResourcesGeneTabContentWrapper({
  geneIds = [],
  isTabExpanded = false,
}: IProps) {
  const zeroDashSdk = useZeroDashSdk();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedGeneId, setSelectedGeneId] = useState<number | null>(geneIds ? geneIds[0].value : null);
  const [genes, setGenes] = useState<{[key: number]: IExtendedGene}>({});
  const [activeGene, setActiveGene] = useState<IExtendedGene | null>(null);

  function onGeneSelect(val: number) {
    setSelectedGeneId(val);
    setActiveGene(genes[val] || null);
  }

  useEffect(() => {
    async function getGenes() {
      setIsLoading(true);
      const getGenesPromises = geneIds.map((gene) => zeroDashSdk.gene.getGene(gene.value));

      const genesSettledResp = await Promise.allSettled(getGenesPromises);
      const genesToSet = genesSettledResp.reduce((acc, settledResp) => {
        if (settledResp.status === 'fulfilled') {
          const geneResp = settledResp.value;
          acc[geneResp.geneId] = geneResp;
          if (selectedGeneId === geneResp.geneId) {
            setActiveGene(geneResp);
          }
        }

        return acc;
      }, {} as {[key: number]: IExtendedGene});

      setGenes(genesToSet);
      setIsLoading(false);
    }
    getGenes();
  }, [geneIds, selectedGeneId, zeroDashSdk.gene]);

  if (isLoading) {
    return (<LoadingAnimation />);
  }
  if (activeGene) {
    return (
      <div style={{ height: 'calc(100% - 48px)' }}>
        {geneIds.length > 1 && (
          <MultiSwitch
            values={geneIds}
            activeValue={selectedGeneId}
            onValSelect={onGeneSelect}
          />
        )}
        <ResourcesGeneTabContent gene={activeGene} />
      </div>
    );
  }
  return <CustomTypography variant="bodyRegular"><b>Could not find gene</b></CustomTypography>;
}
