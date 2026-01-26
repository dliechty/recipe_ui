import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                vscode: {
                    bg: { value: "#1e1e1e" },
                    surface: { value: "#252526" },
                    border: { value: "#454545" },
                    text: { value: "#d4d4d4" },
                    textMuted: { value: "#a0a0a0" },
                    accent: { value: "#007acc" },
                    button: { value: "#0e639c" },
                    buttonHover: { value: "#1177bb" },
                    inputBg: { value: "#3c3c3c" },
                    // Status colors (dark theme friendly)
                    errorBg: { value: "#4a1515" },
                    errorText: { value: "#f8b4b4" },
                    errorBorder: { value: "#7f1d1d" },
                    successBg: { value: "#14532d" },
                    successText: { value: "#86efac" },
                    successBorder: { value: "#166534" },
                    warningBg: { value: "#713f12" },
                    warningText: { value: "#fde68a" },
                    warningBorder: { value: "#854d0e" },
                    // Button variants
                    dangerButton: { value: "#b91c1c" },
                    dangerButtonHover: { value: "#991b1b" },
                    successButton: { value: "#15803d" },
                    successButtonHover: { value: "#166534" },
                    secondaryButton: { value: "#4b5563" },
                    secondaryButtonHover: { value: "#374151" },
                    // Overlay
                    backdrop: { value: "rgba(0, 0, 0, 0.6)" },
                },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    canvas: { value: "{colors.vscode.bg}" },
                    surface: { value: "{colors.vscode.surface}" },
                    muted: { value: "{colors.vscode.inputBg}" },
                },
                fg: {
                    default: { value: "{colors.vscode.text}" },
                    muted: { value: "{colors.vscode.textMuted}" },
                },
                border: {
                    default: { value: "{colors.vscode.border}" },
                },
                // Status semantic tokens
                status: {
                    error: { value: "{colors.vscode.errorText}" },
                    errorBg: { value: "{colors.vscode.errorBg}" },
                    errorBorder: { value: "{colors.vscode.errorBorder}" },
                    success: { value: "{colors.vscode.successText}" },
                    successBg: { value: "{colors.vscode.successBg}" },
                    successBorder: { value: "{colors.vscode.successBorder}" },
                    warning: { value: "{colors.vscode.warningText}" },
                    warningBg: { value: "{colors.vscode.warningBg}" },
                    warningBorder: { value: "{colors.vscode.warningBorder}" },
                },
                // Button semantic tokens
                button: {
                    primary: { value: "{colors.vscode.button}" },
                    primaryHover: { value: "{colors.vscode.buttonHover}" },
                    secondary: { value: "{colors.vscode.secondaryButton}" },
                    secondaryHover: { value: "{colors.vscode.secondaryButtonHover}" },
                    danger: { value: "{colors.vscode.dangerButton}" },
                    dangerHover: { value: "{colors.vscode.dangerButtonHover}" },
                    success: { value: "{colors.vscode.successButton}" },
                    successHover: { value: "{colors.vscode.successButtonHover}" },
                },
                // Overlay semantic tokens
                overlay: {
                    backdrop: { value: "{colors.vscode.backdrop}" },
                },
            },
        },
    },
})

export const system = createSystem(defaultConfig, config)
