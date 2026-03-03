import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { system } from "../theme";
import { themeColors } from "../utils/styles";

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

// =================================================================
// Single Source of Truth: styles.ts themeColors must derive from theme.ts
// =================================================================

// Helper to get raw token values from theme.ts vscode tokens
function getVscodeTokens(): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = system._config as any;
  const vscode = cfg.theme?.tokens?.colors?.vscode ?? {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(vscode)) {
    result[key] = (entry as { value: string }).value;
  }
  return result;
}

describe("styles.ts themeColors single source of truth", () => {
  const vscodeTokens = getVscodeTokens();

  // ---------------------------------------------------------------
  // FR-1.2a: themeColors values must match theme.ts token values
  // ---------------------------------------------------------------
  describe("themeColors values match theme.ts vscode token values", () => {
    // Every key in themeColors should have a matching vscode.* token
    // with an identical value
    const themeColorEntries = Object.entries(themeColors) as [string, string][];

    for (const [key, value] of themeColorEntries) {
      it(`themeColors.${key} ("${value}") matches vscode.${key} token`, () => {
        expect(
          vscodeTokens[key],
          `Expected vscode.${key} token to exist in theme.ts`,
        ).toBeDefined();
        expect(
          value,
          `themeColors.${key} should equal vscode.${key} token value`,
        ).toBe(vscodeTokens[key]);
      });
    }
  });

  // ---------------------------------------------------------------
  // FR-1.2b: styles.ts must not contain independent hex definitions
  // in themeColors — it should derive values from theme.ts imports
  // ---------------------------------------------------------------
  describe("themeColors does not contain independent hex definitions", () => {
    const stylesSource = readFileSync(
      resolve(__dirname, "..", "utils", "styles.ts"),
      "utf-8",
    );

    it("styles.ts imports color values from theme.ts (not hard-coded)", () => {
      // Extract just the themeColors object from the source
      const themeColorsMatch = stylesSource.match(
        /export\s+const\s+themeColors\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
      );
      expect(
        themeColorsMatch,
        "Should find themeColors declaration in styles.ts",
      ).toBeTruthy();

      const themeColorsBody = themeColorsMatch![1];

      // Check for hard-coded hex values like '#1e1e1e' or "#1e1e1e"
      const hexPattern = /['"]#[0-9a-fA-F]{3,8}['"]/g;
      const hexMatches = themeColorsBody.match(hexPattern) || [];

      expect(
        hexMatches.length,
        `themeColors should not contain hard-coded hex values, but found: ${hexMatches.join(", ")}. ` +
          `Values should be derived from theme.ts tokens.`,
      ).toBe(0);
    });

    it("styles.ts imports color values from theme.ts (not hard-coded rgba)", () => {
      const themeColorsMatch = stylesSource.match(
        /export\s+const\s+themeColors\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
      );
      expect(themeColorsMatch).toBeTruthy();

      const themeColorsBody = themeColorsMatch![1];

      // Check for hard-coded rgba values
      const rgbaPattern = /['"]rgba\([^)]+\)['"]/g;
      const rgbaMatches = themeColorsBody.match(rgbaPattern) || [];

      expect(
        rgbaMatches.length,
        `themeColors should not contain hard-coded rgba values, but found: ${rgbaMatches.join(", ")}. ` +
          `Values should be derived from theme.ts tokens.`,
      ).toBe(0);
    });

    it("styles.ts imports from theme.ts", () => {
      // styles.ts should import something from theme.ts to derive its values
      const importsTheme = /import\s+.*from\s+['"]\.\.\/theme['"]/.test(
        stylesSource,
      ) || /import\s+.*from\s+['"]\.\.\/\.\.\/theme['"]/.test(stylesSource);

      expect(
        importsTheme,
        "styles.ts should import from theme.ts to derive themeColors values",
      ).toBe(true);
    });
  });
});
