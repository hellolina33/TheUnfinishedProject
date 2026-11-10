import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "..",
  testMatch: ["**/day04/*.spec.mjs", "**/day06/*.spec.mjs"],
  timeout: 45000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  reporter: "list",
  use: {
    baseURL: process.env.STUDIO_URL || "http://127.0.0.1:8764",
    trace: "retain-on-failure",
  },
  webServer: process.env.STUDIO_URL
    ? undefined
    : {
        command: "node tests/day04/server.mjs",
        cwd: new URL("../../", import.meta.url).pathname,
        port: 8764,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CHROME_PATH
          ? { launchOptions: { executablePath: process.env.CHROME_PATH } }
          : {}),
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
