import type { Group } from '@/types/Auth/Group.types';
import type { ICommonResp } from '@/types/Common.types';

export const groups: ICommonResp<Group>[] = [
  {
    id: 'df6b0414-cf9d-4b23-bf8a-ebaaccbcdb9c',
    name: 'Admins',
  },
  {
    id: '3ca7818f-943f-4009-b729-52b30ff90ede',
    name: 'CancerGeneticists',
  },
  {
    id: 'e1d89730-0c47-41dd-8732-2dad54e74f80',
    name: 'ClinicalFellows',
  },
  {
    id: 'c623dad5-ddcc-4b63-a357-ff9286dfa5b6',
    name: 'Clinicians',
  },
  {
    id: '75cd2c3f-7158-4379-add4-738e137b507b',
    name: 'Curators',
  },
  {
    id: '9a57f9f2-52fa-4add-813d-c1b8286da596',
    name: 'DACs',
  },
  {
    id: '892c3501-d997-4dca-b7ce-a444b7045970',
    name: 'MolecularOncologists',
  },
  {
    id: '9529dcfc-c0d6-484d-aebd-ea8e31dc9671',
    name: 'MTBChairs',
  },
  {
    id: 'ab3c4bfe-1b0c-4844-9235-344010f3c5ad',
    name: 'PDTCUsers',
  },
  {
    id: 'b8e4bc7d-52af-4727-af7c-fdf4bc49c484',
    name: 'Viewers',
  },
];
