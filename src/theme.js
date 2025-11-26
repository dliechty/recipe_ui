import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                github: {
                    bg: { value: "#0d1117" },
                    surface: { value: "#161b22" },
                    border: { value: "#30363d" },
                    text: { value: "#c9d1d9" },
                    textMuted: { value: "#8b949e" },
                    accent: { value: "#58a6ff" },
                    button: { value: "#238636" },
                    buttonHover: { value: "#2ea043" },
                    inputBg: { value: "#0d1117" },
                },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    canvas: { value: "{colors.github.bg}" },
                    surface: { value: "{colors.github.surface}" },
                },
                fg: {
                    default: { value: "{colors.github.text}" },
                    muted: { value: "{colors.github.textMuted}" },
                },
                border: {
                    default: { value: "{colors.github.border}" },
                },
            },
        },
    },
})

export const system = createSystem(defaultConfig, config)
