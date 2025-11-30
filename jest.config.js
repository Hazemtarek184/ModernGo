/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/index.ts',
        '!src/**/*.module.ts',
        '!src/**/*.router.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testTimeout: 30000,
    // Map ES modules to their CommonJS versions
    moduleNameMapper: {
        '^uuid$': 'uuid'
    },
    // Allow Jest to transform ES modules from node_modules
    transformIgnorePatterns: [
        'node_modules/(?!uuid)'
    ]
};
