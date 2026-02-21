import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    rules: {
      // ✅ Allow 'any' type
      '@typescript-eslint/no-explicit-any': 'off',

      // ✅ Allow unused variables
      '@typescript-eslint/no-unused-vars': 'off',

      // ✅ Allow empty functions
      '@typescript-eslint/no-empty-function': 'off',

      // ✅ Allow require() in TS
      '@typescript-eslint/no-var-requires': 'off',

      // Optional: Relax general JS strictness
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
])