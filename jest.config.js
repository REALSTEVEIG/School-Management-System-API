module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'managers/**/*.js',
        '!managers/**/*.schema.js',
        '!managers/**/*.mongoModel.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 30000
};
