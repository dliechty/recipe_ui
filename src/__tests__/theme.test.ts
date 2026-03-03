import { describe, it, expect } from "vitest";
import { system } from "../theme";

/**
 * Theme Semantic Token Validation Tests
 *
 * These tests verify that the theme's semantic token system is complete
 * and that all expected token categories have the required variants.
 * Tokens are accessed via system._config.theme.semanticTokens.colors.
 */

// Helper to access semantic tokens from the theme config
function getSemanticColors() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = system._config as any;
  return cfg.theme?.semanticTokens?.colors ?? {};
}

// Helper to check that a token path resolves to an object with a `value` property
function expectTokenExists(
  colors: Record<string, unknown>,
  category: string,
  token: string,
) {
  const cat = colors[category] as Record<string, unknown> | undefined;
  const entry = cat?.[token] as { value?: unknown } | undefined;
  expect(
    entry,
    `Expected semantic token "${category}.${token}" to exist`,
  ).toBeDefined();
  expect(
    entry?.value,
    `Expected semantic token "${category}.${token}" to have a value`,
  ).toBeDefined();
}

describe("Theme semantic tokens", () => {
  const colors = getSemanticColors();

  // ---------------------------------------------------------------
  // Existing tokens (sanity checks — these should already pass)
  // ---------------------------------------------------------------
  describe("existing tokens (sanity)", () => {
    it("has bg tokens: canvas, surface, muted", () => {
      expectTokenExists(colors, "bg", "canvas");
      expectTokenExists(colors, "bg", "surface");
      expectTokenExists(colors, "bg", "muted");
    });

    it("has fg tokens: default, muted", () => {
      expectTokenExists(colors, "fg", "default");
      expectTokenExists(colors, "fg", "muted");
    });

    it("has border.default", () => {
      expectTokenExists(colors, "border", "default");
    });

    it("has existing button tokens", () => {
      for (const t of [
        "primary",
        "primaryHover",
        "secondary",
        "secondaryHover",
        "danger",
        "dangerHover",
        "success",
        "successHover",
      ]) {
        expectTokenExists(colors, "button", t);
      }
    });

    it("has existing status tokens", () => {
      for (const t of [
        "error",
        "errorBg",
        "errorBorder",
        "success",
        "successBg",
        "successBorder",
        "warning",
        "warningBg",
        "warningBorder",
      ]) {
        expectTokenExists(colors, "status", t);
      }
    });

    it("has overlay.backdrop", () => {
      expectTokenExists(colors, "overlay", "backdrop");
    });
  });

  // ---------------------------------------------------------------
  // NEW tokens — these should FAIL until implemented in theme.ts
  // ---------------------------------------------------------------
  describe("button.text token", () => {
    it("has button.text for readable text on button backgrounds", () => {
      expectTokenExists(colors, "button", "text");
    });
  });

  describe("link tokens", () => {
    it("has link.default", () => {
      expectTokenExists(colors, "link", "default");
    });

    it("has link.hover", () => {
      expectTokenExists(colors, "link", "hover");
    });
  });

  describe("danger semantic tokens", () => {
    it("has danger.fg", () => {
      expectTokenExists(colors, "danger", "fg");
    });

    it("has danger.bg", () => {
      expectTokenExists(colors, "danger", "bg");
    });

    it("has danger.bgHover", () => {
      expectTokenExists(colors, "danger", "bgHover");
    });
  });

  describe("success semantic tokens", () => {
    it("has success.fg", () => {
      expectTokenExists(colors, "success", "fg");
    });

    it("has success.bg", () => {
      expectTokenExists(colors, "success", "bg");
    });

    it("has success.bgHover", () => {
      expectTokenExists(colors, "success", "bgHover");
    });
  });

  describe("info semantic tokens", () => {
    it("has info.fg", () => {
      expectTokenExists(colors, "info", "fg");
    });

    it("has info.bg", () => {
      expectTokenExists(colors, "info", "bg");
    });
  });

  describe("badge semantic tokens", () => {
    it("has badge.admin", () => {
      expectTokenExists(colors, "badge", "admin");
    });

    it("has badge.member", () => {
      expectTokenExists(colors, "badge", "member");
    });

    it("has badge.pending", () => {
      expectTokenExists(colors, "badge", "pending");
    });
  });

  // ---------------------------------------------------------------
  // Completeness: every status variant has base / bg / border
  // ---------------------------------------------------------------
  describe("status category completeness", () => {
    const statusTypes = ["error", "success", "warning"];
    const suffixes = ["", "Bg", "Border"];

    for (const status of statusTypes) {
      for (const suffix of suffixes) {
        const token = `${status}${suffix}`;
        it(`has status.${token}`, () => {
          expectTokenExists(colors, "status", token);
        });
      }
    }
  });
});
