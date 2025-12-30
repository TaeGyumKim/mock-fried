// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground-openapi',
      './playground-proto',
    ],
  },
})
  .append({
    // Ignore patterns
    ignores: [
      'dist/',
      'node_modules/',
      '.nuxt/',
      '.output/',
      'coverage/',
      '.yarn/',
    ],
  })
  .append({
    // Custom rules
    rules: {
      // Allow console in development
      'no-console': 'warn',
      // Prefer const
      'prefer-const': 'error',
      // No unused vars (allow underscore prefix)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  })
