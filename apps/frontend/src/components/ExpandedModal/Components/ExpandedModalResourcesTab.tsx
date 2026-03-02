import { ReactElement, useState } from 'react';

import { CustomTabs } from '@/components/Common/Tabs';
import {
    Grid, styled,
} from '@mui/material';
import { ENDPOINT, IFRAME } from '../../../types/Common.types';
import { ISelectOption, VariantType } from '../../../types/misc.types';
import { IGermlineSV, ISomaticSV } from '../../../types/SV.types';
import { IframeComponent } from '../../Iframes';
import LinkResourceTab from './LinkResourceTab';
import EvidenceContent from './Resources/Evidence/EvidenceContent';
import { ResourcesGeneTabContentWrapper } from './Resources/GeneTab/Wrapper';

const MainContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  borderLeft: `2px solid ${theme.colours.core.grey30}`,
}));

export interface IResourceParams {
  cosmic?: string;
  clinvar?: string;
  gnomad?: string;
  pecan?: string;
  genome?: string;
  varSom?: string;
  civic?: { gene?: string; variant?: string };
  geneCard?: string | string[];
  ucscData?: Partial<Pick<ISomaticSV | IGermlineSV, 'chrBkpt1' | 'chrBkpt2' | 'posBkpt1' | 'posBkpt2' | 'biosampleId'>>;
  oncokb?: string;
  geneIds?: ISelectOption<number>[];
}

interface IProps {
  params?: IResourceParams;
  variantType: VariantType;
  varintId: string | number;
  handleExpandPanel: () => void;
}

export default function ExpandedModalResourcesTab({
  params,
  variantType,
  varintId,
  handleExpandPanel,
}: IProps): ReactElement<any> {
  const [tab, setTab] = useState<string>('evidence');
  const tabs = [
    {
      label: 'Evidence',
      value: 'evidence',
      children: (
        <EvidenceContent
          variantType={variantType}
          variantId={varintId}
          handleExpandPanel={handleExpandPanel}
        />
      ),
    },
    {
      label: 'Links',
      value: 'links',
      children: (
        <LinkResourceTab
          variantType={variantType}
          genomeLink={params?.genome}
          ucscData={params?.ucscData}
          pecanLink={params?.pecan}
          varSomeLink={params?.varSom}
          civic={params?.civic}
          geneCard={params?.geneCard}
          oncokbLink={params?.oncokb}
          cosmic={params?.cosmic}
        />
      ),
    },
    ...(params?.geneIds?.length
      ? [
        {
          label: 'Gene',
          value: 'gene',
          children: (
            <ResourcesGeneTabContentWrapper geneIds={params.geneIds} />
          ),
        },
      ]
      : []),
    {
      label: 'GNOMAD',
      value: 'gnomad',
      children: (
        <IframeComponent
          baseUrl={ENDPOINT.GNOMAD}
          params={params}
          type={IFRAME.GNOMAD}
        />
      ),
    },
    {
      label: 'ClinVar',
      value: 'clinvar',
      children: (
        <IframeComponent
          baseUrl={ENDPOINT.CLINVAR_URL}
          params={params}
          type={IFRAME.CLINVAR}
        />
      ),
    },
  ];

  return (
    <MainContainer container flexDirection="column" flexWrap="nowrap">
      <CustomTabs
        fullWidth
        variant="sub-navigation"
        sx={{ width: '100%' }}
        value={tab}
        onChange={(e, value): void => setTab(value)}
        tabs={tabs.map((t) => ({ label: t.label, value: t.value }))}
      />
      {tabs.find((t) => t.value === tab)?.children}
    </MainContainer>
  );
}
