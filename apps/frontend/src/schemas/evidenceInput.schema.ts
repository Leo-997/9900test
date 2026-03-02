import * as yup from 'yup';

export const evidenceInputSchema = {
  CITATION: yup.object({
    source: yup.string().required('source is required'),
    title: yup.string().required('title is required'),
    authors: yup.string().required('author is required'),
    year: yup.number().required('year is required').typeError('Must be a valid year'),
    externalId: yup.string().when('source', {
      is: (val: string) => ['PUBMED', 'PMC'].includes(val),
      then: (schema) => schema.required('Id is required'),
    }),
  }),
  IMG: yup.object({
    name: yup.string().required('resource name is required'),
    file: yup
      .mixed<File>()
      .required('A file is required')
      .test(
        'file',
        'Please attach a image file (.jpg, jpeg, gif, ,png)',
        (value) => value
          && ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(
            value.type,
          ),
      ),
  }),
  PDF: yup.object({
    name: yup.string().required('resource name is required'),
    file: yup
      .mixed<File>()
      .required('A file is required')
      .test(
        'file',
        'Not a PDF',
        (value) => value && value.type === 'application/pdf',
      ),
  }),
  LINK: yup.object({
    name: yup.string().required('Resource name is required'),
    url: yup.string().required('URL is required'),
  }),
};
