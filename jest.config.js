/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Map each @nextsparkjs/core sub-path to its own stub so jest.mock() keys don't collide
    '^@nextsparkjs/core/lib/auth$':          '<rootDir>/__mocks__/nextsparkjs/auth.js',
    '^@nextsparkjs/core/lib/db$':            '<rootDir>/__mocks__/nextsparkjs/db.js',
    '^@nextsparkjs/core/lib/email/factory$': '<rootDir>/__mocks__/nextsparkjs/email-factory.js',
    '^@nextsparkjs/core/lib/email/send$':    '<rootDir>/__mocks__/nextsparkjs/email-send.js',
    '^@nextsparkjs/core/lib/config$':        '<rootDir>/__mocks__/nextsparkjs/config.js',
    '^@nextsparkjs/core/(.*)$':              '<rootDir>/__mocks__/empty.js',
    // Explicit mappings for routes with [id] dynamic segments (Jest glob-escaping issue)
    '^.*app/api/barber-shop/barbers/\\[id\\]/invite/route$':
      '<rootDir>/app/api/barber-shop/barbers/[id]/invite/route.ts',
    '^.*app/api/barber-shop/barbers/\\[id\\]/link-account/route$':
      '<rootDir>/app/api/barber-shop/barbers/[id]/link-account/route.ts',
    '^.*app/api/barber-shop/calendar/route$':
      '<rootDir>/app/api/barber-shop/calendar/route.ts',
    '^.*app/api/barber-shop/products/route$':
      '<rootDir>/app/api/barber-shop/products/route.ts',
    '^.*app/api/barber-shop/products/\\[id\\]/route$':
      '<rootDir>/app/api/barber-shop/products/[id]/route.ts',
    '^@/themes/(.*)$': '<rootDir>/contents/themes/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/lib/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node',
        esModuleInterop: true,
        strict: true,
      },
    }],
  },
}
