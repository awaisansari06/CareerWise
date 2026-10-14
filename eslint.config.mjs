import { fixupPluginRules } from '@eslint/compat';
import nextPlugin from '@next/eslint-plugin-next';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [{
  files: ['**/*.{js,jsx,ts,tsx,mjs}'],
  ignores: ['node_modules/**', '.next/**', 'output/**'],
  languageOptions: {ecmaVersion:'latest',sourceType:'module',parserOptions:{ecmaFeatures:{jsx:true}}},
  settings: {react:{version:'detect'}},
  plugins: {'@next/next':fixupPluginRules(nextPlugin),react,'react-hooks':hooks},
  rules: {
    ...react.configs.recommended.rules,
    ...hooks.configs.recommended.rules,
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
    'react/react-in-jsx-scope':'off',
    'react/prop-types':'off',
    'react/no-unknown-property':['error',{ignore:['jsx','global']}],
  },
}];
