/**
 * This file was generated from ToastNotification.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, NativeIcon } from "mendix";

export type PositionEnum = "top" | "bottom";

export interface ToastNotificationProps<Style> {
    name: string;
    style: Style[];
    type: EditableValue<string>;
    header: EditableValue<string>;
    body?: EditableValue<string>;
    visible: EditableValue<boolean>;
    autoDismissDuration: number;
    swipeToDismiss: boolean;
    position: PositionEnum;
    customIconSuccess?: DynamicValue<NativeIcon>;
    customIconWarning?: DynamicValue<NativeIcon>;
    customIconError?: DynamicValue<NativeIcon>;
    customIconInfo?: DynamicValue<NativeIcon>;
    onDismiss?: ActionValue;
}

export interface ToastNotificationPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    type: string;
    header: string;
    body: string;
    visible: string;
    autoDismissDuration: number | null;
    swipeToDismiss: boolean;
    position: PositionEnum;
    customIconSuccess: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    customIconWarning: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    customIconError: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    customIconInfo: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    onDismiss: {} | null;
}
