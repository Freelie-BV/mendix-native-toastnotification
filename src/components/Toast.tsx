import { ReactElement } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { IconValue } from "mendix";

import { ToastIcon } from "./ToastIcon";

export type ToastType = "success" | "warning" | "error" | "info";

interface TypeStyle {
    bg: string;
    accent: string;
}

export const STYLE_BY_TYPE: Record<ToastType, TypeStyle> = {
    success: { bg: "#F0FDF4", accent: "#00A63E" },
    warning: { bg: "#FFFBEB", accent: "#E17100" },
    error: { bg: "#FEF2F2", accent: "#E7000B" },
    info: { bg: "#F3F6F8", accent: "#0C364B" }
};

export interface ToastStyleOverrides {
    container?: ViewStyle;
    header?: TextStyle;
    body?: TextStyle;
}

export interface ToastProps {
    type: ToastType;
    header: string;
    body?: string;
    customIcon?: IconValue;
    overrides?: ToastStyleOverrides;
}

/**
 * Presentational toast card: [ icon ] [ header (bold) / body (regular) ].
 * Layout and colors follow the widget spec; Mendix design-property overrides are
 * merged on top via the `overrides` prop.
 */
export function Toast({ type, header, body, customIcon, overrides }: ToastProps): ReactElement {
    const { bg, accent } = STYLE_BY_TYPE[type];

    return (
        <View style={[styles.container, { backgroundColor: bg }, overrides?.container]}>
            <View style={styles.iconWrapper}>
                <ToastIcon type={type} accent={accent} backgroundColor={bg} customIcon={customIcon} />
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.header, overrides?.header]}>{header}</Text>
                {body ? <Text style={[styles.body, overrides?.body]}>{body}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        borderRadius: 12
    },
    iconWrapper: {
        width: 16,
        height: 16,
        marginRight: 16
    },
    textWrapper: {
        flex: 1
    },
    header: {
        color: "#0A2330",
        fontWeight: "bold",
        fontSize: 12
    },
    body: {
        color: "#0A2330",
        fontWeight: "normal",
        fontSize: 12
    }
});
