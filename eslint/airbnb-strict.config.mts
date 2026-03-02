import { Config } from 'eslint/config';

export const airbnbStrict: Config = {
  rules: {
    // babel inserts `'use strict';` for us
    strict: ['error', 'never'],
  },
};
