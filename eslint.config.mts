import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginJSXA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import styledComponentsPlugin from 'eslint-plugin-styled-components-varname';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { airbnbBestPractices } from './eslint/airbnb-best-practices.config.mts';
import { airbnbErrors } from './eslint/airbnb-errors.config.mts';
import { airbnbEs6 } from './eslint/airbnb-es6.config.mts';
import { airbnbImports } from './eslint/airbnb-imports.config.mts';
import { airbnbNode } from './eslint/airbnb-node.config.mts';
import { airbnbReactA11y } from './eslint/airbnb-react-a11y.config.mts';
import { airbnbReact } from './eslint/airbnb-react.config.mts';
import { airbnbStrict } from './eslint/airbnb-strict.config.mts';
import { airbnbStyle } from './eslint/airbnb-style.config.mts';
import { airbnbVariables } from './eslint/airbnb-variables.config.mts';
import { airbnbReactHooks } from './eslint/airbnb-hooks.config.mts';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  airbnbBestPractices,
  airbnbErrors,
  airbnbNode,
  airbnbStyle,
  airbnbVariables,
  airbnbEs6,
  airbnbImports,
  airbnbStrict,
  airbnbReact,
  airbnbReactA11y,
  airbnbReactHooks,
  tseslint.configs.eslintRecommended,
  tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  importPlugin.flatConfigs.typescript,
  pluginJSXA11y.flatConfigs.recommended,
  {
    plugins: {
      'styled-components-varname': styledComponentsPlugin,
    },
    rules: {},
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    name: 'custom-rules',
    rules: {
      'object-curly-spacing': 1,
      'array-bracket-spacing': 1,
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-useless-constructor': 'off',
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'max-classes-per-file': 'off',
      'react/jsx-pascal-case': [
        1,
        {
          allowNamespace: true,
        },
      ],
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'import',
          format: null,
        },
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          prefix: ['I'],
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          types: ['function'],
          format: ['PascalCase', 'camelCase'],
        },
        {
          selector: 'parameter',
          types: ['function'],
          format: ['PascalCase', 'camelCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
        },
        {
          selector: 'property',
          format: null,
          modifiers: ['requiresQuotes'],
        },
      ],
      semi: [2, 'always'],
      'import/no-cycle': 'off',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
]);
