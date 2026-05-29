const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: 'tests/e2e',
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    use: {
        baseURL: 'http://127.0.0.1:4173',
        headless: true,
        viewport: { width: 1440, height: 900 }
    },
    webServer: {
        command: 'node tests/scripts/static-server.js',
        url: 'http://127.0.0.1:4173/epub-reader.html',
        reuseExistingServer: true,
        timeout: 30_000
    }
});
