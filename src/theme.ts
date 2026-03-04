import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Raw VS Code-inspired color values — the single source of truth for all color definitions.
 * Imported by styles.ts (for non-Chakra components like react-select) and used below
 * to define Chakra UI design tokens.
 */
export const vsCodeColors = {
    // Core colors
    bg: "#1e1e1e",
    surface: "#252526",
    border: "#454545",
    text: "#d4d4d4",
    textMuted: "#a0a0a0",
    accent: "#007acc",
    button: "#0e639c",
    buttonHover: "#1177bb",
    buttonText: "#ffffff",
    buttonGhostHover: "rgba(14, 99, 156, 0.1)",
    inputBg: "#3c3c3c",
    // Status colors (dark theme friendly)
    errorBg: "#4a1515",
    errorText: "#f8b4b4",
    errorBorder: "#7f1d1d",
    successBg: "#14532d",
    successText: "#86efac",
    successBorder: "#166534",
    warningBg: "#713f12",
    warningText: "#fde68a",
    warningBorder: "#854d0e",
    // Button variants
    dangerButton: "#b91c1c",
    dangerButtonHover: "#991b1b",
    successButton: "#15803d",
    successButtonHover: "#166534",
    secondaryButton: "#4b5563",
    secondaryButtonHover: "#374151",
    // Info
    infoBg: "#1e3a5f",
    // Badge
    badgeAdmin: "#007acc",
    badgeMember: "#15803d",
    badgePending: "#854d0e",
    // Overlay
    backdrop: "rgba(0, 0, 0, 0.6)",
    overlaySubtle: "rgba(255, 255, 255, 0.04)",
    overlayHover: "rgba(255, 255, 255, 0.06)",
    overlayActive: "rgba(255, 255, 255, 0.16)",
    overlayPressed: "rgba(255, 255, 255, 0.24)",
    // Danger extended
    dangerMuted: "#fca5a5",
    dangerBgSubtle: "#450a0a",
    // Warning action (for transfer/warning action buttons - amber tones)
    warningButton: "#b45309",
    warningButtonHover: "#92400e",
    warningBgSubtle: "#451a03",
    // Badge extended
    badgeAdminBg: "#1e3a5f",
    badgeAdminText: "#93c5fd",
    badgeMemberBg: "#374151",
    badgeMemberText: "#d1d5db",
    badgePendingBg: "#713f12",
    badgePendingText: "#fde68a",
    // Shadows
    menuShadow: "rgba(0, 0, 0, 0.4)",
} as const;

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                vscode: {
                    bg: { value: vsCodeColors.bg },
                    surface: { value: vsCodeColors.surface },
                    border: { value: vsCodeColors.border },
                    text: { value: vsCodeColors.text },
                    textMuted: { value: vsCodeColors.textMuted },
                    accent: { value: vsCodeColors.accent },
                    button: { value: vsCodeColors.button },
                    buttonHover: { value: vsCodeColors.buttonHover },
                    buttonText: { value: vsCodeColors.buttonText },
                    buttonGhostHover: { value: vsCodeColors.buttonGhostHover },
                    inputBg: { value: vsCodeColors.inputBg },
                    // Status colors (dark theme friendly)
                    errorBg: { value: vsCodeColors.errorBg },
                    errorText: { value: vsCodeColors.errorText },
                    errorBorder: { value: vsCodeColors.errorBorder },
                    successBg: { value: vsCodeColors.successBg },
                    successText: { value: vsCodeColors.successText },
                    successBorder: { value: vsCodeColors.successBorder },
                    warningBg: { value: vsCodeColors.warningBg },
                    warningText: { value: vsCodeColors.warningText },
                    warningBorder: { value: vsCodeColors.warningBorder },
                    // Button variants
                    dangerButton: { value: vsCodeColors.dangerButton },
                    dangerButtonHover: { value: vsCodeColors.dangerButtonHover },
                    successButton: { value: vsCodeColors.successButton },
                    successButtonHover: { value: vsCodeColors.successButtonHover },
                    secondaryButton: { value: vsCodeColors.secondaryButton },
                    secondaryButtonHover: { value: vsCodeColors.secondaryButtonHover },
                    // Info
                    infoBg: { value: vsCodeColors.infoBg },
                    // Badge
                    badgeAdmin: { value: vsCodeColors.badgeAdmin },
                    badgeMember: { value: vsCodeColors.badgeMember },
                    badgePending: { value: vsCodeColors.badgePending },
                    // Overlay
                    backdrop: { value: vsCodeColors.backdrop },
                    overlaySubtle: { value: vsCodeColors.overlaySubtle },
                    overlayHover: { value: vsCodeColors.overlayHover },
                    overlayActive: { value: vsCodeColors.overlayActive },
                    overlayPressed: { value: vsCodeColors.overlayPressed },
                    // Danger extended
                    dangerMuted: { value: vsCodeColors.dangerMuted },
                    dangerBgSubtle: { value: vsCodeColors.dangerBgSubtle },
                    // Warning action
                    warningButton: { value: vsCodeColors.warningButton },
                    warningButtonHover: { value: vsCodeColors.warningButtonHover },
                    warningBgSubtle: { value: vsCodeColors.warningBgSubtle },
                    // Badge extended
                    badgeAdminBg: { value: vsCodeColors.badgeAdminBg },
                    badgeAdminText: { value: vsCodeColors.badgeAdminText },
                    badgeMemberBg: { value: vsCodeColors.badgeMemberBg },
                    badgeMemberText: { value: vsCodeColors.badgeMemberText },
                    badgePendingBg: { value: vsCodeColors.badgePendingBg },
                    badgePendingText: { value: vsCodeColors.badgePendingText },
                    // Shadows
                    menuShadow: { value: vsCodeColors.menuShadow },
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
                    text: { value: "{colors.vscode.buttonText}" },
                    ghostHover: { value: "{colors.vscode.buttonGhostHover}" },
                },
                // Link semantic tokens
                link: {
                    default: { value: "{colors.vscode.accent}" },
                    hover: { value: "{colors.vscode.buttonHover}" },
                },
                // Danger semantic tokens
                danger: {
                    fg: { value: "{colors.vscode.errorText}" },
                    bg: { value: "{colors.vscode.dangerButton}" },
                    bgHover: { value: "{colors.vscode.dangerButtonHover}" },
                    muted: { value: "{colors.vscode.dangerMuted}" },
                    bgSubtle: { value: "{colors.vscode.dangerBgSubtle}" },
                },
                // Success semantic tokens
                success: {
                    fg: { value: "{colors.vscode.successText}" },
                    bg: { value: "{colors.vscode.successButton}" },
                    bgHover: { value: "{colors.vscode.successButtonHover}" },
                },
                // Info semantic tokens
                info: {
                    fg: { value: "{colors.vscode.accent}" },
                    bg: { value: "{colors.vscode.infoBg}" },
                },
                // Warning semantic tokens
                warning: {
                    fg: { value: "{colors.vscode.warningText}" },
                    bg: { value: "{colors.vscode.warningButton}" },
                    bgHover: { value: "{colors.vscode.warningButtonHover}" },
                    border: { value: "{colors.vscode.warningBorder}" },
                    bgSubtle: { value: "{colors.vscode.warningBgSubtle}" },
                },
                // Badge semantic tokens
                badge: {
                    admin: { value: "{colors.vscode.badgeAdmin}" },
                    member: { value: "{colors.vscode.badgeMember}" },
                    pending: { value: "{colors.vscode.badgePending}" },
                    adminBg: { value: "{colors.vscode.badgeAdminBg}" },
                    adminText: { value: "{colors.vscode.badgeAdminText}" },
                    memberBg: { value: "{colors.vscode.badgeMemberBg}" },
                    memberText: { value: "{colors.vscode.badgeMemberText}" },
                    pendingBg: { value: "{colors.vscode.badgePendingBg}" },
                    pendingText: { value: "{colors.vscode.badgePendingText}" },
                },
                // Overlay semantic tokens
                overlay: {
                    backdrop: { value: "{colors.vscode.backdrop}" },
                    subtle: { value: "{colors.vscode.overlaySubtle}" },
                    hover: { value: "{colors.vscode.overlayHover}" },
                    active: { value: "{colors.vscode.overlayActive}" },
                    pressed: { value: "{colors.vscode.overlayPressed}" },
                },
            },
        },
    },
})

export const system = createSystem(defaultConfig, config)
