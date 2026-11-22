import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    fileParallelism: false,
    hookTimeout: 180_000,
    testTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'vitest-only-secret-with-at-least-32-characters',
      JWT_EXPIRES_IN: '1h',
      RESEND_API_KEY: '',
      SELLER_INVITE_TTL_HOURS: '72',
    },
  },
});
