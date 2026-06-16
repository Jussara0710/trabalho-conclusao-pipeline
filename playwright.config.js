// playwright.config.js
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,

  // Relatórios: lista no terminal + HTML + JSON (para artefato na pipeline)
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "reports/playwright-results.json" }],
  ],

  use: {
    baseURL: "http://localhost:4321",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  webServer: {
    command: "npx http-server public -p 4321 -c-1 --silent",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
