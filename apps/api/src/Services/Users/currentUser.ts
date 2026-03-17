import type { IUserWithMetadata } from 'Models/Users/Users.model';

export const currentUser: IUserWithMetadata = {
  id: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3',
  givenName: 'Harper',
  familyName: 'Calloway',
  email: '',
  title: undefined,
  azureId: '',
  avatar: 'colour:#AB6EE5,#9B51E0',
  groups: [{ id: 'df6b0414-cf9d-4b23-bf8a-ebaaccbcdb9c', name: 'Admins' }],
  roles: [{
    id: '09753c0e-eeff-47b4-a3ec-4070261a2d71', name: 'ZeroDash Admin',
  }, {
    id: '43ded2de-a43b-4287-aa62-0eccd0fb551c', name: 'ZeroDash Viewer',
  }, {
    id: '4e256603-0bf7-4f0c-b7a1-d7619e9b1981', name: 'ZeroDash Curator',
  }, {
    id: '75fc018e-1eda-491b-8307-f2e35d3c0ee3', name: 'ZeroDash MTB Chair',
  }],
  scopes: [{
    id: 'a3100abd-5975-40dd-b743-313ea8519bc7', name: 'report.molecular.content.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '1849983e-9eb9-40c8-af7f-2e20b026de8f', name: 'curation.sample.hts.download', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '245eb48c-4d1a-430e-9e98-20dec5c82934', name: 'file.download', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '2cad8197-f377-4a90-9839-5629f10395c0', name: 'curation.sample.download', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '30095cc4-a812-40b8-b644-ba96b9136026', name: 'clinical.sample.assigned.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '3633395f-6f55-440c-a4c0-63861c546c79', name: 'clinical.sample.read', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '47be398d-6ca0-4ed7-a481-e24a100955e5', name: 'curation.evidence.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '54be18a8-0407-400a-be59-e08e29e0aed7', name: 'curation.sample.assigned.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '55376b92-6a91-45eb-89ee-3f658ba55417', name: 'report.molecular.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '5a90a9cc-f63d-4a30-82fe-2f75801b27fa', name: 'atlas.read', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '5b5d0c32-4b5c-4969-ac3f-4b56a68c2d2b', name: 'clinical.sample.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '6536af07-e04e-4257-89e0-937e97be2320', name: 'report.mtb.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '6b8f0d9c-291f-4f3e-a6a2-de91a5b3abda', name: 'report.preclinical.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '6c974ee4-a8a5-4811-bad2-f0ebf64400ce', name: 'evidence.download', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '6fb2c3db-1013-4b98-a78b-b2c762bb869c', name: 'report.germline.content.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '796e85bd-a99e-43eb-ac01-b6d81fb217e2', name: 'curation.sample.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '7e4c9ba5-1b98-41bd-837d-c11c3b9ce8fa', name: 'report.redacted.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '83fcfa3d-3ff1-41ce-af44-f250950e9420', name: 'common.sample.suggestion.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '91709e62-d418-4722-9937-6708e1f5369c', name: 'report.assign', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: '91c0e84d-615b-474a-93a1-479c74619318', name: 'atlas.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'a14f0c5a-ca82-4af4-af40-263990b0eeef', name: 'report.preclinical.content.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'a44d74f2-98d8-443b-bb58-340e10a7b8f8', name: 'curation.status.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'af65d1f5-e7dc-4cbe-aa2a-0d20563632d0', name: 'report.germline.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'bd1bba0e-c873-4372-ad6c-561eb0765e56', name: 'curation.germline.gene.list.read', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'c34e2563-c5ff-4e31-a22f-cf82e8ed16c8', name: 'report.meta.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'c6dbb4ca-2b97-4579-b95d-743953031a59', name: 'curation.sample.read', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'c85c2367-4b86-4608-8c3f-eb67efc802f9', name: 'curation.patient.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'c9b80fa4-6e1d-436d-9a3a-8005c57e46ee', name: 'report.finalise', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'cd6ebfdc-516a-42b8-95cc-7079f8f77033', name: 'report.mtb.content.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'd35c2270-d08d-4d4a-bf68-e224f7f41a7a', name: 'curation.sample.hts.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'd921b014-6c6b-4acf-8698-b0b2ebd56f35', name: 'report.download', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'de101382-497b-46a1-8323-afcda85ec38c', name: 'evidence.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'efc20bc3-7db7-400c-a169-e0ff447b39bb', name: 'report.read', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }, {
    id: 'ff344209-5c02-470b-a3b7-9c1c39362093', name: 'curation.gene.list.write', applicationId: 'e5e1b213-ca55-4362-8582-27c254908f80', applicationName: 'ZeroDash',
  }],
  accessControls: [{
    id: '93809480-421b-4219-94c5-d4dddd82fe92', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '06ff647a-5c04-4f03-9a93-1e8ada8c0b0e', name: 'TELETHONKIDS' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'f76d0f41-d3bc-4aee-b74a-ec920b7032b2', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '3caa38ce-525e-4329-ae36-94279dabc69e', name: 'TARGET' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'e40eb172-1878-4d8b-a176-327e9b4c06dc', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '421022f2-4759-4ddf-b57e-093a3b8a6016', name: 'ZERO2' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '50f36f31-2ade-428b-9204-68b2f12417cd', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '46129c71-7815-42ae-b6d7-0498aff29646', name: 'Hudson' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '85796440-d9a6-4ee5-88aa-c8b3fd89347a', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '4d6f6a0c-40ef-4939-acb5-a5631d2c6ecb', name: 'SIOPEN' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '5a801bc3-2a45-4515-a3d4-e7e4b8df2c09', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '51d30d72-497e-403f-8472-39bb78177182', name: 'Cohort B Rare Cancers' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'a75e4488-918d-40c0-a404-53bcde318d09', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '59d8f7bc-361d-4634-8ecd-ac2fa506d86d', name: 'MELBOURNE' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '08e3f159-cd1c-4925-ad2e-f76dc9147bf8', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '670b21a3-227e-409d-b833-3224462e8ec9', name: '3DTumouroids' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '771f2f50-1544-45d7-aecf-822bc045807d', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '72a20e35-2082-4822-b654-0c36288ef83a', name: 'ZERO-Repeat' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'af5c760b-5d95-4a93-b74d-291647400dc5', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '7a363716-97f2-4ffd-ad7f-43ed920cf91b', name: 'PersoMed-1' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '1e74043f-5844-43bb-ac40-262d63ab2edb', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '800d535b-f603-4b5a-ab79-e8f3f691b451', name: 'HMPPMP' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '4ab54517-e094-4b6b-9c25-e2979df4ef1e', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '953b2fe9-d723-439e-84ae-20b6d1c5751a', name: 'DCROUCHER' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'e0ed7227-0bdc-4707-92e6-896a80345653', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: '9fbb5c51-a5ce-4ab9-a56d-f2c18b069997', name: 'RETROSPECTIVE' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '7fb6045d-6b1b-4097-9afc-3c05ccfcf764', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: 'd5fe652b-d449-477c-bda1-97b9c7b92134', name: 'DIPGM-montreal' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: 'f16a3988-8487-4e43-905f-b14c0211d7a8', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: 'd802604f-e89d-4079-b3ab-358b70b51a6c', name: 'PRISM' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '5ca7f527-95c9-4d82-abba-52ee1f55a7d8', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: 'eeb1593b-a396-42a1-b1ab-11dad1758a9a', name: 'MattDun' }, patientId: null, biosampleId: null, isReadonly: false,
  }, {
    id: '0d784f40-3011-4848-b916-f5ea4fd55dbe', userId: '9546a0cb-08f7-4133-9a20-11c9cfe6a3d3', study: { id: 'f8d04bfe-10b3-4c70-9e93-43a8ec196dcf', name: 'MRD' }, patientId: null, biosampleId: null, isReadonly: false,
  }],
};
