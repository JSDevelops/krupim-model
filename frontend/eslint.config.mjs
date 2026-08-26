import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Legacy UI screens still contain broad data shapes and React 19 migration
  // findings. Keep them visible without blocking builds while security-critical
  // API/auth files are linted strictly in CI.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    files: [
      'src/app/api/**/*.ts',
      'src/lib/api.ts',
      'src/lib/localData.ts',
      'src/proxy.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
      'react-hooks/purity': 'error',
      'react-hooks/immutability': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
