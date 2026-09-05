import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // Integration tests share one Postgres database; running files in parallel
    // would let them clobber each other's fixtures.
    fileParallelism: false,
    setupFiles: ['tests/setup.ts'],
    testTimeout: 20_000,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
