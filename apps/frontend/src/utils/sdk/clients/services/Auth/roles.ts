import type { Role } from '@/types/Auth/Role.types';
import type { ICommonResp } from '@/types/Common.types';

export const roles: ICommonResp<Role>[] = [{
  id: '09753c0e-eeff-47b4-a3ec-4070261a2d71',
  name: 'ZeroDash Admin',
}, {
  id: '24d84a24-b4a0-43c1-bfae-c9e39af3601f',
  name: 'ZeroDash PDTC',
}, {
  id: '3672138f-6a11-49c5-89a8-1f7b6aecabb1',
  name: 'ZeroDash Assigned Curator',
}, {
  id: '43ded2de-a43b-4287-aa62-0eccd0fb551c',
  name: 'ZeroDash Viewer',
}, {
  id: '4e256603-0bf7-4f0c-b7a1-d7619e9b1981',
  name: 'ZeroDash Curator',
}, {
  id: '75fc018e-1eda-491b-8307-f2e35d3c0ee3',
  name: 'ZeroDash MTB Chair',
}, {
  id: '77dfe0f4-b51f-4f27-bb5b-2374b7bd56b6',
  name: 'ZeroDash Clinician',
}, {
  id: '9bf7932d-9890-44f8-b3b6-614b33046440',
  name: 'ZeroDash Assigned Clinician',
}, {
  id: 'dab3453f-f0c9-4663-aa7d-99bb246bbcf8',
  name: 'ZeroDash DAC',
}];
