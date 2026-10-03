import { createElement } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

vi.mock("next/link", () => ({
  default: function MockLink({ href, children, ...rest }) {
    const to = typeof href === "string" ? href : (href?.pathname ?? "#");
    return createElement("a", { href: to, ...rest }, children);
  },
}));
