import loadable from '@loadable/component';
import { TabProps } from '@/types/Tabs.types';
import { LoadingPage } from '@/pages/Loading/Loading';

/* eslint-disable @typescript-eslint/naming-convention */
const PatientProfileTabContent = loadable(
  () => import('@/components/CurationValidationTabs/PatientProfileTabContent'),
  { fallback: <LoadingPage /> },
);
const TumourProfileTabContent = loadable(
  () => import('@/components/CurationValidationTabs/TumourProfileTabContent'),
  { fallback: <LoadingPage /> },
);
const ComparisonTabContent = loadable(
  () => import('@/components/PreCurationTabs/ComparisonTabContent'),
  { fallback: <LoadingPage /> },
);
const ClassifiersTabContent = loadable(
  () => import('@/components/PreCurationTabs/ClassifiersTabContent'),
  { fallback: <LoadingPage /> },
);
const CNVGermlineTabContent = loadable(
  () => import('@/components/PreCurationTabs/CNVGermlineTabContent'),
  { fallback: <LoadingPage /> },
);
const CNVTabContent = loadable(
  () => import('@/components/PreCurationTabs/CNVTabContent'),
  { fallback: <LoadingPage /> },
);
const CytogeneticsGermlineTabContent = loadable(
  () => import('@/components/PreCurationTabs/CytogeneticsGermlineTabContent'),
  { fallback: <LoadingPage /> },
);
const CytogeneticsTabContent = loadable(
  () => import('@/components/PreCurationTabs/CytogeneticsTabContent'),
  { fallback: <LoadingPage /> },
);
const HTSTabContent = loadable(
  () => import('@/components/PreCurationTabs/HTSTabContent'),
  { fallback: <LoadingPage /> },
);
const MutationalSignaturesTabContent = loadable(
  () => import('@/components/PreCurationTabs/MutationalSignaturesTabContent'),
  { fallback: <LoadingPage /> },
);
const PathwaysTabContent = loadable(
  () => import('@/components/PreCurationTabs/PathwaysTabContent'),
  { fallback: <LoadingPage /> },
);
const RNASeqTabContent = loadable(
  () => import('@/components/PreCurationTabs/RNASeqTabContent'),
  { fallback: <LoadingPage /> },
);
const SNVGermlineTabContent = loadable(
  () => import('@/components/PreCurationTabs/SNVGermlineTabContent'),
  { fallback: <LoadingPage /> },
);
const SNVTabContent = loadable(
  () => import('@/components/PreCurationTabs/SNVTabContent'),
  { fallback: <LoadingPage /> },
);
const SVGermlineTabContent = loadable(
  () => import('@/components/PreCurationTabs/SVGermlineTabContent'),
  { fallback: <LoadingPage /> },
);
const SVTabContent = loadable(
  () => import('@/components/PreCurationTabs/SVTabContent'),
  { fallback: <LoadingPage /> },
);
const GeneDashboard = loadable(
  () => import('@/pages/Atlas/GeneDashboard'),
  { fallback: <LoadingPage /> },
);
const TumourClassifiers = loadable(
  () => import('@/pages/Atlas/TumourClassifiers'),
  { fallback: <LoadingPage /> },
);

export const curationTabs: TabProps[] = [
  {
    label: 'Patient Profile',
    to: 'profile',
    altPaths: [''],
    children: <PatientProfileTabContent />,
  },
  {
    label: 'Tumour Profile',
    to: 'tumour_profile',
    children: <TumourProfileTabContent />,
  },
  {
    label: 'Comparison',
    to: 'comparison',
    children: <ComparisonTabContent />,
  },
  {
    label: 'SNVs',
    to: 'snv',
    children: <SNVTabContent />,
  },
  {
    label: 'CNVs',
    to: 'cnv',
    children: <CNVTabContent />,
  },
  {
    label: 'SVs',
    to: 'sv',
    children: <SVTabContent />,
  },
  {
    label: 'RNASeq',
    to: 'rna_seq',
    children: <RNASeqTabContent />,
  },
  {
    label: 'Cytogenetics',
    to: 'cytogenetics',
    children: <CytogeneticsTabContent />,
  },
  {
    label: 'Classifiers',
    to: 'classifier',
    children: <ClassifiersTabContent />,
  },
  {
    label: 'Germline SNVs',
    to: 'germline_snv',
    children: <SNVGermlineTabContent />,
  },
  {
    label: 'Germline CNVs',
    to: 'germline_cnv',
    children: <CNVGermlineTabContent />,
  },
  {
    label: 'Germline SVs',
    to: 'germline_sv',
    children: <SVGermlineTabContent />,
  },
  {
    label: 'Germline Cytogenetics',
    to: 'germline_cytogenetics',
    children: <CytogeneticsGermlineTabContent />,
  },
  {
    label: 'Pathways',
    to: 'pathways',
    children: <PathwaysTabContent />,
  },
  {
    label: 'Mut Signatures',
    to: 'mutational_signatures',
    children: <MutationalSignaturesTabContent />,
  },
  {
    label: 'HTS',
    to: 'hts',
    children: <HTSTabContent />,
  },
];

export const curationAtlasTabs: TabProps[] = [
  {
    label: 'Gene Dashboard',
    to: 'gene-dashboard',
    children: <GeneDashboard />,
  },
  {
    label: 'Tumour Classifiers',
    to: 'tumour-classifiers',
    children: <TumourClassifiers />,
  },
];
