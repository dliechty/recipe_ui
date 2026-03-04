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

    it("has overlay.subtle", () => {
      expectTokenExists(colors, "overlay", "subtle");
    });

    it("has overlay.hover", () => {
      expectTokenExists(colors, "overlay", "hover");
    });

    it("has overlay.active", () => {
      expectTokenExists(colors, "overlay", "active");
    });

    it("has overlay.pressed", () => {
      expectTokenExists(colors, "overlay", "pressed");
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

    it("has danger.muted", () => {
      expectTokenExists(colors, "danger", "muted");
    });

    it("has danger.bgSubtle", () => {
      expectTokenExists(colors, "danger", "bgSubtle");
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

  describe("warning semantic tokens", () => {
    it("has warning.fg", () => {
      expectTokenExists(colors, "warning", "fg");
    });

    it("has warning.bg", () => {
      expectTokenExists(colors, "warning", "bg");
    });

    it("has warning.bgHover", () => {
      expectTokenExists(colors, "warning", "bgHover");
    });

    it("has warning.border", () => {
      expectTokenExists(colors, "warning", "border");
    });

    it("has warning.bgSubtle", () => {
      expectTokenExists(colors, "warning", "bgSubtle");
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

    it("has badge.adminBg", () => {
      expectTokenExists(colors, "badge", "adminBg");
    });

    it("has badge.adminText", () => {
      expectTokenExists(colors, "badge", "adminText");
    });

    it("has badge.memberBg", () => {
      expectTokenExists(colors, "badge", "memberBg");
    });

    it("has badge.memberText", () => {
      expectTokenExists(colors, "badge", "memberText");
    });

    it("has badge.pendingBg", () => {
      expectTokenExists(colors, "badge", "pendingBg");
    });

    it("has badge.pendingText", () => {
      expectTokenExists(colors, "badge", "pendingText");
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
      // If themeColors is defined as an object literal, check for hard-coded hex values.
      // If it's a simple assignment from an import (e.g., `= vsCodeColors`), that's already derived.
      const themeColorsObjectMatch = stylesSource.match(
        /export\s+const\s+themeColors\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
      );

      if (themeColorsObjectMatch) {
        const themeColorsBody = themeColorsObjectMatch[1];

        // Check for hard-coded hex values like '#1e1e1e' or "#1e1e1e"
        const hexPattern = /['"]#[0-9a-fA-F]{3,8}['"]/g;
        const hexMatches = themeColorsBody.match(hexPattern) || [];

        expect(
          hexMatches.length,
          `themeColors should not contain hard-coded hex values, but found: ${hexMatches.join(", ")}. ` +
            `Values should be derived from theme.ts tokens.`,
        ).toBe(0);
      } else {
        // themeColors is not an object literal — verify it's assigned from an imported value
        const derivedPattern =
          /export\s+const\s+themeColors\s*=\s*[a-zA-Z_]\w*/;
        expect(
          derivedPattern.test(stylesSource),
          "themeColors should be derived from an imported value",
        ).toBe(true);
      }
    });

    it("styles.ts imports color values from theme.ts (not hard-coded rgba)", () => {
      const themeColorsObjectMatch = stylesSource.match(
        /export\s+const\s+themeColors\s*=\s*\{([\s\S]*?)\}\s*as\s+const/,
      );

      if (themeColorsObjectMatch) {
        const themeColorsBody = themeColorsObjectMatch[1];

        // Check for hard-coded rgba values
        const rgbaPattern = /['"]rgba\([^)]+\)['"]/g;
        const rgbaMatches = themeColorsBody.match(rgbaPattern) || [];

        expect(
          rgbaMatches.length,
          `themeColors should not contain hard-coded rgba values, but found: ${rgbaMatches.join(", ")}. ` +
            `Values should be derived from theme.ts tokens.`,
        ).toBe(0);
      } else {
        // themeColors is not an object literal — it's derived, so no hard-coded rgba possible
        const derivedPattern =
          /export\s+const\s+themeColors\s*=\s*[a-zA-Z_]\w*/;
        expect(
          derivedPattern.test(stylesSource),
          "themeColors should be derived from an imported value",
        ).toBe(true);
      }
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

// =================================================================
// Phase 3: Component Token Usage Validation
// =================================================================

import { readdirSync, statSync } from "fs";

/**
 * Recursively collect all .tsx files under the given directory.
 * Returns absolute paths.
 */
function collectTsxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectTsxFiles(full));
    } else if (full.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Get component files from src/features and src/components,
 * excluding SnakeGame.tsx and anything under src/client/.
 */
function getComponentFiles(extraExcludes: string[] = []): string[] {
  const srcDir = resolve(__dirname, "..");
  const dirs = [
    resolve(srcDir, "features"),
    resolve(srcDir, "components"),
  ];
  const allFiles: string[] = [];
  for (const d of dirs) {
    try {
      allFiles.push(...collectTsxFiles(d));
    } catch {
      // directory may not exist
    }
  }
  return allFiles.filter((f) => {
    const basename = f.split("/").pop() ?? "";
    if (basename === "SnakeGame.tsx") return false;
    if (f.includes("/client/")) return false;
    for (const ex of extraExcludes) {
      if (basename === ex) return false;
    }
    return true;
  });
}

describe("Component token usage (Phase 3)", () => {
  // ---------------------------------------------------------------
  // 1. No color="white" on buttons in component files
  // ---------------------------------------------------------------
  describe('no color="white" on button elements', () => {
    const files = getComponentFiles();

    it("component files should not use color=\"white\" or color='white'", () => {
      const violations: string[] = [];

      for (const filePath of files) {
        const source = readFileSync(filePath, "utf-8");
        // Match color="white" or color='white' — these are typically
        // used on Buttons and should be replaced with semantic tokens
        const pattern = /color=["']white["']/g;
        let match;
        while ((match = pattern.exec(source)) !== null) {
          // Find approximate line number
          const lineNum =
            source.substring(0, match.index).split("\n").length;
          const relPath = filePath.replace(resolve(__dirname, "..") + "/", "");
          violations.push(`${relPath}:${lineNum}`);
        }
      }

      expect(
        violations,
        `Found color="white" in component files (should use semantic tokens like button.text):\n` +
          violations.map((v) => `  - ${v}`).join("\n"),
      ).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // 2. No raw Chakra palette colors in component files
  // ---------------------------------------------------------------
  describe("no raw Chakra palette colors in components", () => {
    // Exclude theme.ts, styles.ts, and SnakeGame.tsx
    const files = getComponentFiles(["theme.ts", "styles.ts"]);

    // Raw palette patterns like red.400, green.500, blue.500, etc.
    const rawPalettePattern =
      /(?:["'{, ])((?:red|green|blue|yellow|orange|whiteAlpha|gray|teal|cyan|purple|pink)\.\d{2,3})(?:["'}, ])/g;

    it("component files should not reference raw Chakra palette colors", () => {
      const violations: string[] = [];

      for (const filePath of files) {
        const source = readFileSync(filePath, "utf-8");
        let match;
        // Reset lastIndex since we reuse the regex
        rawPalettePattern.lastIndex = 0;
        while ((match = rawPalettePattern.exec(source)) !== null) {
          const lineNum =
            source.substring(0, match.index).split("\n").length;
          const relPath = filePath.replace(resolve(__dirname, "..") + "/", "");
          violations.push(`${relPath}:${lineNum} → ${match[1]}`);
        }
      }

      expect(
        violations,
        `Found raw Chakra palette colors in component files (should use semantic tokens):\n` +
          violations.map((v) => `  - ${v}`).join("\n"),
      ).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------
  // 3. ErrorBoundary uses colorPalette, not colorScheme
  // ---------------------------------------------------------------
  describe("ErrorBoundary uses colorPalette not colorScheme", () => {
    const errorBoundaryPath = resolve(
      __dirname,
      "..",
      "components",
      "common",
      "ErrorBoundary.tsx",
    );
    const source = readFileSync(errorBoundaryPath, "utf-8");

    it("ErrorBoundary.tsx does NOT contain colorScheme", () => {
      const hasColorScheme = /colorScheme/.test(source);
      expect(
        hasColorScheme,
        'ErrorBoundary.tsx should not use colorScheme (Chakra v2 API). Use colorPalette instead.',
      ).toBe(false);
    });

    it("ErrorBoundary.tsx DOES contain colorPalette", () => {
      const hasColorPalette = /colorPalette/.test(source);
      expect(
        hasColorPalette,
        'ErrorBoundary.tsx should use colorPalette (Chakra v3 API) for button color theming.',
      ).toBe(true);
    });
  });
});
