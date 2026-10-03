import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // ignoreRestSiblings: react-markdown 컴포넌트가 `{ node, ...props }`로 node를
      // 걷어내고 props만 DOM에 스프레드하는 패턴(PostDetail) — 걷어내려고 꺼낸 변수는
      // 쓰지 않아도 오류로 보지 않는다.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', ignoreRestSiblings: true }],
    },
  },
])
