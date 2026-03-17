import type { IUserWithMetadata } from 'Models/User/User.model';

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
};
