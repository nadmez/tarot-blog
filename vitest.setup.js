import { createElement } from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("next/link", () => ({
  default: function MockLink({ href, children, ...rest }) {
    const to = typeof href === "string" ? href : (href?.pathname ?? "#");
    return createElement("a", { href: to, ...rest }, children);
  },
}));
