import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, TextStyle, ViewStyle } from "react-native";

import { Style, mergeNativeStyles } from "@mendix/pluggable-widgets-tools";
import { ActionValue, ValueStatus } from "mendix";

import { Toast, ToastType } from "./components/Toast";
import { ToastNotificationProps } from "../typings/ToastNotificationProps";

export interface CustomStyle extends Style {
    container: ViewStyle;
    header: TextStyle;
    body: TextStyle;
}

const defaultStyle: CustomStyle = {
    container: {},
    header: {},
    body: {}
};

const ANIMATION_DURATION = 250;
const SWIPE_THRESHOLD = 40;
const HORIZONTAL_MARGIN = 16;
const VERTICAL_INSET = 48;
const OFFSCREEN = 120;

type DismissReason = "timer" | "swipe" | "external";

export function ToastNotification(props: ToastNotificationProps<CustomStyle>): ReactElement | null {
    const {
        type,
        header,
        body,
        visible,
        position,
        autoDismissDuration,
        swipeToDismiss,
        customIconSuccess,
        customIconWarning,
        customIconError,
        customIconInfo,
        onDismiss,
        style
    } = props;

    const toastType: ToastType = (type?.value as ToastType) ?? "info";
    const customIconByType = {
        success: customIconSuccess?.value,
        warning: customIconWarning?.value,
        error: customIconError?.value,
        info: customIconInfo?.value
    };
    const headerText = header?.value ?? "";
    const bodyText = body?.value;
    const isVisible = visible?.value === true;
    const isTop = position === "top";
    const hiddenOffset = isTop ? -OFFSCREEN : OFFSCREEN;

    const styles = mergeNativeStyles(defaultStyle, style);

    const [rendered, setRendered] = useState(false);

    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDismissing = useRef(false);
    const prevVisible = useRef(false);

    // Mutable mirror of the latest props so the stable callbacks below (and the
    // PanResponder, which is created once) never read stale values.
    const latest = useRef({ autoDismissDuration, hiddenOffset, onDismiss, visible, swipeToDismiss, isTop });
    latest.current = { autoDismissDuration, hiddenOffset, onDismiss, visible, swipeToDismiss, isTop };

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const dismiss = useCallback(
        (reason: DismissReason) => {
            if (isDismissing.current) {
                return;
            }
            isDismissing.current = true;
            clearTimer();
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: latest.current.hiddenOffset,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true })
            ]).start(({ finished }) => {
                if (!finished) {
                    isDismissing.current = false;
                    return;
                }
                setRendered(false);
                isDismissing.current = false;
                const v = latest.current.visible;
                // The widget only writes the attribute back for dismissals it
                // initiated; an external hide already set it to false.
                if (reason !== "external" && v?.status === ValueStatus.Available && v.value === true) {
                    v.setValue(false);
                }
                executeAction(latest.current.onDismiss);
            });
        },
        [translateY, opacity, clearTimer]
    );

    const show = useCallback(() => {
        clearTimer();
        isDismissing.current = false;
        setRendered(true);
        translateY.setValue(latest.current.hiddenOffset);
        opacity.setValue(0);
        Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true })
        ]).start(({ finished }) => {
            if (finished && latest.current.autoDismissDuration > 0) {
                timerRef.current = setTimeout(() => dismiss("timer"), latest.current.autoDismissDuration * 1000);
            }
        });
    }, [translateY, opacity, clearTimer, dismiss]);

    // React to rising/falling edges of the Visible attribute. Edge detection (not
    // a simple `isVisible && !rendered` check) prevents the toast from re-showing
    // after an auto-dismiss writes Visible back to false asynchronously.
    useEffect(() => {
        const was = prevVisible.current;
        prevVisible.current = isVisible;
        if (isVisible && !was) {
            show();
        } else if (!isVisible && was && rendered && !isDismissing.current) {
            dismiss("external");
        }
    }, [isVisible, rendered, show, dismiss]);

    // Clear any pending auto-dismiss timer on unmount.
    useEffect(() => clearTimer, [clearTimer]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_evt, gesture) => {
                    if (!latest.current.swipeToDismiss) {
                        return false;
                    }
                    const inDismissDirection = latest.current.isTop ? gesture.dy < 0 : gesture.dy > 0;
                    return (
                        inDismissDirection && Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 4
                    );
                },
                onPanResponderMove: (_evt, gesture) => {
                    // Only follow the finger in the dismiss direction.
                    const dy = latest.current.isTop ? Math.min(0, gesture.dy) : Math.max(0, gesture.dy);
                    translateY.setValue(dy);
                },
                onPanResponderRelease: (_evt, gesture) => {
                    const pastThreshold = latest.current.isTop
                        ? gesture.dy < -SWIPE_THRESHOLD
                        : gesture.dy > SWIPE_THRESHOLD;
                    if (pastThreshold) {
                        dismiss("swipe");
                    } else {
                        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
                    }
                }
            }),
        [translateY, dismiss]
    );

    if (!rendered) {
        return null;
    }

    return (
        <Animated.View
            style={[
                overlayStyles.overlay,
                isTop ? { top: VERTICAL_INSET } : { bottom: VERTICAL_INSET },
                { transform: [{ translateY }], opacity }
            ]}
            {...panResponder.panHandlers}
        >
            <Toast
                type={toastType}
                header={headerText}
                body={bodyText}
                customIcon={customIconByType[toastType]}
                overrides={{ container: styles.container, header: styles.header, body: styles.body }}
            />
        </Animated.View>
    );
}

function executeAction(action?: ActionValue): void {
    if (action && action.canExecute && !action.isExecuting) {
        action.execute();
    }
}

const overlayStyles = StyleSheet.create({
    overlay: {
        position: "absolute",
        left: HORIZONTAL_MARGIN,
        right: HORIZONTAL_MARGIN,
        zIndex: 9999,
        elevation: 9999
    }
});
