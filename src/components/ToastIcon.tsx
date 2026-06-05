import { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "mendix/components/native/Icon";
import { IconValue } from "mendix";

import { ToastType } from "./Toast";

export interface ToastIconProps {
    type: ToastType;
    /** Accent color used to fill the default glyph badge. */
    accent: string;
    /** Card background color, used to cut the octagon corners. */
    backgroundColor: string;
    /** Optional Mendix icon that overrides the default glyph. */
    customIcon?: IconValue;
}

const SIZE = 16;
const CORNER = 5;

/**
 * Renders the toast icon. When a custom Mendix icon is provided it takes
 * precedence; otherwise a default glyph is drawn using React Native primitives
 * only (View, Text, StyleSheet) — no SVG libraries or icon fonts.
 */
export function ToastIcon({ type, accent, backgroundColor, customIcon }: ToastIconProps): ReactElement {
    if (customIcon) {
        return (
            <View style={styles.container}>
                <Icon icon={customIcon as Parameters<typeof Icon>[0]["icon"]} size={SIZE} color={accent} />
            </View>
        );
    }

    switch (type) {
        case "warning":
            return (
                <View style={styles.container}>
                    <View style={[styles.triangle, { borderBottomColor: accent }]} />
                    <Glyph char="!" style={styles.triangleGlyph} />
                </View>
            );
        case "error":
            return (
                <View style={styles.container}>
                    <View style={[styles.octagon, { backgroundColor: accent }]}>
                        <View style={[styles.corner, styles.cornerTL, cornerColor(backgroundColor, "TL")]} />
                        <View style={[styles.corner, styles.cornerTR, cornerColor(backgroundColor, "TR")]} />
                        <View style={[styles.corner, styles.cornerBL, cornerColor(backgroundColor, "BL")]} />
                        <View style={[styles.corner, styles.cornerBR, cornerColor(backgroundColor, "BR")]} />
                    </View>
                    <Glyph char="!" style={styles.centeredGlyph} />
                </View>
            );
        case "success":
            return (
                <View style={[styles.container, styles.circle, { backgroundColor: accent }]}>
                    <Glyph char="✓" style={styles.circleGlyph} />
                </View>
            );
        case "info":
        default:
            return (
                <View style={[styles.container, styles.circle, { backgroundColor: accent }]}>
                    <Glyph char="i" style={styles.circleGlyph} />
                </View>
            );
    }
}

function Glyph({ char, style }: { char: string; style: object }): ReactElement {
    return <Text style={style}>{char}</Text>;
}

function cornerColor(color: string, corner: "TL" | "TR" | "BL" | "BR"): object {
    switch (corner) {
        case "TL":
        case "TR":
            return { borderTopColor: color };
        default:
            return { borderBottomColor: color };
    }
}

const styles = StyleSheet.create({
    container: {
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center"
    },
    circle: {
        borderRadius: SIZE / 2
    },
    circleGlyph: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        includeFontPadding: false
    },
    centeredGlyph: {
        position: "absolute",
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
        includeFontPadding: false
    },
    // Upward-pointing triangle drawn via the transparent-border trick.
    triangle: {
        width: 0,
        height: 0,
        borderLeftWidth: SIZE / 2,
        borderRightWidth: SIZE / 2,
        borderBottomWidth: SIZE - 2,
        borderLeftColor: "transparent",
        borderRightColor: "transparent"
    },
    triangleGlyph: {
        position: "absolute",
        bottom: 0,
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        includeFontPadding: false
    },
    // Filled square whose four corners are cut to form an octagon silhouette.
    octagon: {
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center"
    },
    corner: {
        position: "absolute",
        width: 0,
        height: 0
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER,
        borderRightWidth: CORNER,
        borderRightColor: "transparent"
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER,
        borderLeftWidth: CORNER,
        borderLeftColor: "transparent"
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER,
        borderRightWidth: CORNER,
        borderRightColor: "transparent"
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER,
        borderLeftWidth: CORNER,
        borderLeftColor: "transparent"
    }
});
