import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      JWT_SECRET: "secret-khusus-untuk-testing-minimal-32-karakter",
    },
  },
});
