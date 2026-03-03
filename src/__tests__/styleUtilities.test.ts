import { describe, it, expect } from "vitest";
import {
  themeColors,
  nativeSelectStyles,
  inputStyles,
  focusRingStyles,
  buttonStyles,
  scrollbarStyles,
} from "../utils/styles";

/**
 * Style Utilities Tests
 *
 * Tests for shared style utility objects exported from src/utils/styles.ts.
 * These utilities provide consistent Chakra UI style props and CSS-in-JS
 * objects for inputs, buttons, focus rings, and scrollbars.
 *
 * Tests for NEW utilities (inputStyles, focusRingStyles, buttonStyles,
 * scrollbarStyles) are expected to FAIL until those exports are implemented.
 */

// =================================================================
// nativeSelectStyles (already exists — should pass)
// =================================================================
describe("nativeSelectStyles", () => {
  it("has backgroundColor from themeColors.inputBg", () => {
    expect(nativeSelectStyles.backgroundColor).toBe(themeColors.inputBg);
  });

  it("has borderColor from themeColors.border", () => {
    expect(nativeSelectStyles.borderColor).toBe(themeColors.border);
  });

  it("has color from themeColors.text", () => {
    expect(nativeSelectStyles.color).toBe(themeColors.text);
  });
});

// =================================================================
// inputStyles (new — will fail until implemented)
// =================================================================
describe("inputStyles", () => {
  it("exports inputStyles as an object", () => {
    expect(inputStyles).toBeDefined();
    expect(typeof inputStyles).toBe("object");
  });

  it("has bg set to vscode.inputBg semantic token", () => {
    expect(inputStyles.bg).toBe("vscode.inputBg");
  });

  it("has borderColor set to border.default semantic token", () => {
    expect(inputStyles.borderColor).toBe("border.default");
  });

  it("has color set to fg.default semantic token", () => {
    expect(inputStyles.color).toBe("fg.default");
  });

  it("has _hover with borderColor set to vscode.accent", () => {
    expect(inputStyles._hover).toEqual({ borderColor: "vscode.accent" });
  });

  it("has _focus with borderColor and boxShadow using vscode.accent", () => {
    expect(inputStyles._focus).toEqual({
      borderColor: "vscode.accent",
      boxShadow: "0 0 0 1px var(--chakra-colors-vscode-accent)",
    });
  });
});

// =================================================================
// focusRingStyles (new — will fail until implemented)
// =================================================================
describe("focusRingStyles", () => {
  it("exports focusRingStyles as an object", () => {
    expect(focusRingStyles).toBeDefined();
    expect(typeof focusRingStyles).toBe("object");
  });

  it("has _hover with borderColor set to vscode.accent", () => {
    expect(focusRingStyles._hover).toEqual({
      borderColor: "vscode.accent",
    });
  });

  it("has _focus with borderColor and boxShadow using vscode.accent", () => {
    expect(focusRingStyles._focus).toEqual({
      borderColor: "vscode.accent",
      boxShadow: "0 0 0 1px var(--chakra-colors-vscode-accent)",
    });
  });

  it("produces the same _hover and _focus values as inputStyles", () => {
    expect(focusRingStyles._hover).toEqual(inputStyles._hover);
    expect(focusRingStyles._focus).toEqual(inputStyles._focus);
  });
});

// =================================================================
// buttonStyles (new — will fail until implemented)
// =================================================================
describe("buttonStyles", () => {
  it("exports buttonStyles as an object", () => {
    expect(buttonStyles).toBeDefined();
    expect(typeof buttonStyles).toBe("object");
  });

  describe("primary variant", () => {
    it("has bg set to button.primary token", () => {
      expect(buttonStyles.primary.bg).toBe("button.primary");
    });

    it("has _hover.bg set to button.primaryHover token", () => {
      expect(buttonStyles.primary._hover).toEqual({
        bg: "button.primaryHover",
      });
    });

    it("has color set to button.text token", () => {
      expect(buttonStyles.primary.color).toBe("button.text");
    });
  });

  describe("danger variant", () => {
    it("has bg set to button.danger token", () => {
      expect(buttonStyles.danger.bg).toBe("button.danger");
    });

    it("has _hover.bg set to button.dangerHover token", () => {
      expect(buttonStyles.danger._hover).toEqual({
        bg: "button.dangerHover",
      });
    });

    it("has color set to button.text token", () => {
      expect(buttonStyles.danger.color).toBe("button.text");
    });
  });

  describe("success variant", () => {
    it("has bg set to button.success token", () => {
      expect(buttonStyles.success.bg).toBe("button.success");
    });

    it("has _hover.bg set to button.successHover token", () => {
      expect(buttonStyles.success._hover).toEqual({
        bg: "button.successHover",
      });
    });

    it("has color set to button.text token", () => {
      expect(buttonStyles.success.color).toBe("button.text");
    });
  });

  describe("secondary variant", () => {
    it("has bg set to button.secondary token", () => {
      expect(buttonStyles.secondary.bg).toBe("button.secondary");
    });

    it("has _hover.bg set to button.secondaryHover token", () => {
      expect(buttonStyles.secondary._hover).toEqual({
        bg: "button.secondaryHover",
      });
    });

    it("has color set to button.text token", () => {
      expect(buttonStyles.secondary.color).toBe("button.text");
    });
  });
});

// =================================================================
// scrollbarStyles (new — will fail until implemented)
// =================================================================
describe("scrollbarStyles", () => {
  it("exports scrollbarStyles as an object", () => {
    expect(scrollbarStyles).toBeDefined();
    expect(typeof scrollbarStyles).toBe("object");
  });
});
