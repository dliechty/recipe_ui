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
                },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    canvas: { value: "{colors.vscode.bg}" },
                    surface: { value: "{colors.vscode.surface}" },
                },
                fg: {
                    default: { value: "{colors.vscode.text}" },
                    muted: { value: "{colors.vscode.textMuted}" },
                },
                border: {
                    default: { value: "{colors.vscode.border}" },
                },
            },
        },
    },
})

export const system = createSystem(defaultConfig, config)
