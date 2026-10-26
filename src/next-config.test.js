import { afterEach, expect, test, vi } from "vitest";
import nextConfig from "../next.config.mjs";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("proxies /api requests to the local tarot server on port 3001 by default", async () => {
  vi.stubEnv("TAROT_API_URL", "");

  expect(await nextConfig.rewrites()).toEqual([
    {
      source: "/api/:path*",
      destination: "http://localhost:3001/api/:path*",
    },
  ]);
});

test("proxies /api requests to TAROT_API_URL when it is set", async () => {
  vi.stubEnv("TAROT_API_URL", "https://tarot-api.example.com");

  expect(await nextConfig.rewrites()).toEqual([
    {
      source: "/api/:path*",
      destination: "https://tarot-api.example.com/api/:path*",
    },
  ]);
});
