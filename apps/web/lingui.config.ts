import { defineConfig } from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'ud'],
  catalogs: [
    {
      path: '<rootDir>/src/app/i18n/locales/{locale}',
      include: ['src'],
    },
  ],
})
