import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

export const system = extendTheme({
    config,
    colors: {
        vscode: {
            bg: "#1e1e1e",
            surface: "#252526",
            border: "#454545",
            text: "#d4d4d4",
            textMuted: "#a0a0a0",
            accent: "#007acc",
            button: "#0e639c",
            buttonHover: "#1177bb",
            inputBg: "#3c3c3c",
        },
    },
    semanticTokens: {
        colors: {
            bg: {
                canvas: "vscode.bg",
                surface: "vscode.surface",
            },
            fg: {
                default: "vscode.text",
                muted: "vscode.textMuted",
            },
            border: {
                default: "vscode.border",
            },
        },
    },
})
