# Toast Notification

A Mendix **Native (React Native)** pluggable widget that shows a single toast notification banner over your app. Pick one of four types — **success**, **warning**, **error**, or **info** — each with its own background tint, accent color, and default icon. The toast slides and fades in, can auto-dismiss on a timer, be swiped away, or hidden from a microflow/nanoflow, and fires an **On dismiss** action whenever it closes.

- **Widget ID:** `com.freelie.widget.native.toastnotification.ToastNotification`
- **Version:** 1.0.0
- **Platform:** Native only
- **License:** Apache-2.0
- **Author:** Freelie

## Features

- Four notification types — **success / warning / error / info** — each with a distinct background tint, accent color, and built-in icon.
- Smooth slide + fade animation in and out.
- **Auto-dismiss** after a configurable number of seconds (or disable the timer entirely).
- **Swipe to dismiss** — swipe up when anchored to the top, swipe down when anchored to the bottom.
- **Top or bottom** screen position.
- Per-type **custom icons** via Mendix icon properties, with built-in glyphs as fallback.
- **On dismiss** event that fires for every dismiss reason (timer, swipe, or external hide).
- Themeable through Mendix **design properties** (`container`, `header`, `body`).

## Prerequisites — Domain model setup (required)

> **This widget will not work without a backing entity.** The widget renders attributes from a Mendix object in context, so the page (or a parent data container) must provide one. A **Non-persistable entity** is recommended: there is a single toast — no queue — and it resets itself on dismiss, so persisting it adds no value.

The widget binds its attributes **by selection, not by name**, so you may name the entity and attributes however you like — **with one hard exception**: the enumeration **value names** must be exactly `success`, `warning`, `error`, and `info` (see below).

### 1. Create the enumeration

Create an enumeration (e.g. `Severity`) with exactly these four values. The **value name** is what matters — the widget compares the literal strings. The **caption** is free text and can be anything.

| Enumeration value name (required, exact) | Example caption |
| ---------------------------------------- | --------------- |
| `success`                                | Success         |
| `warning`                                | Warning         |
| `error`                                  | Error           |
| `info`                                   | Info            |

If the attribute holds any other value (or is empty), the toast falls back to the **info** style.

### 2. Create the entity

Create an entity (a **Non-persistable entity** named e.g. `Toast` is recommended) with the following attributes. Attribute names are flexible — only the **enumeration value names** above are fixed.

| Attribute (example name) | Type                        | Required | Purpose                                                                          |
| ------------------------ | --------------------------- | -------- | -------------------------------------------------------------------------------- |
| `Severity`               | Enumeration (the one above) | Yes      | Selects the toast **type** (color + default icon). Maps to the `Type` property.  |
| `Header`                 | String                      | Yes      | Bold title line.                                                                 |
| `Body`                   | String                      | No       | Optional secondary line.                                                         |
| `IsVisible`              | Boolean                     | Yes      | The trigger. Set to **true** to show the toast.                                  |

> **Note on naming:** you cannot call the enumeration attribute `Type`, because `Type` is a reserved word in Mendix. That is fine — the attribute name is irrelevant to the widget; only the binding matters. The example above uses `Severity`.

> **`IsVisible` must be writable.** The widget sets this attribute back to **false** itself when the toast dismisses. Bind it to a normal stored boolean — **do not** bind it to a calculated / read-only attribute. Your logic should only ever set it to **true**; the widget handles setting it back to false.

### 3. Provide the object on the page

Place the **Toast Notification** widget inside a data container (e.g. a data view) on a Native page so it receives a `Toast` object in context. The page itself can be empty apart from this — the toast renders as an absolute overlay.

## Configuration

All properties are set in the Mendix Studio Pro widget editor.

### Data

| Property | Type                | Required | Description                                                                                                |
| -------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Type     | Enumeration attribute | Yes    | Enum attribute whose value names are `success` / `warning` / `error` / `info`. Sets the color and default icon. |
| Header   | String attribute    | Yes      | Shown as the bold title of the toast.                                                                      |
| Body     | String attribute    | No       | Optional body text shown under the header.                                                                 |
| Visible  | Boolean attribute   | Yes      | The toast shows when **true**; the widget sets it back to **false** after dismiss.                          |

### Behavior

| Property              | Type        | Default | Description                                                                                                      |
| --------------------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Auto-dismiss duration | Integer     | `3`     | Seconds before the toast auto-dismisses. Set to **`0`** to disable auto-dismiss (the toast stays until swiped or hidden). |
| Swipe to dismiss      | Boolean     | `true`  | Enables the swipe gesture: swipe **up** when position is top, swipe **down** when position is bottom.            |
| Position              | Enum: Top / Bottom | `Top` | Vertical anchor of the toast on screen.                                                                  |

### Appearance

Each property overrides the built-in glyph for that single type. When left empty, the type uses its default built-in icon (✓ for success, `!` triangle for warning, `!` octagon for error, `i` circle for info).

| Property             | Type           | Required | Description                                  |
| -------------------- | -------------- | -------- | -------------------------------------------- |
| Custom icon — success | Mendix icon   | No       | Overrides the default **success** icon.      |
| Custom icon — warning | Mendix icon   | No       | Overrides the default **warning** icon.      |
| Custom icon — error   | Mendix icon   | No       | Overrides the default **error** icon.        |
| Custom icon — info    | Mendix icon   | No       | Overrides the default **info** icon.         |

### Events

| Property   | Type   | Required | Description                                                                                                                   |
| ---------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| On dismiss | Action | No       | Fires when the toast is dismissed **for any reason** — auto-dismiss timer, swipe, or `Visible` set to false externally. Make the handler **idempotent**, since the same dismiss should produce the same result regardless of cause. |

## How to show and dismiss a toast

**Showing a toast** (from a microflow or nanoflow):

1. Retrieve or create your `Toast` object (a freshly created non-persistable object works well).
2. Set the attributes you want to display:
   - `Severity` → one of `success`, `warning`, `error`, `info`
   - `Header` → the title
   - `Body` → optional secondary text
3. Set `IsVisible` to **true**.
4. Commit / refresh the object in the client so the widget sees the change.

The widget is **edge-triggered**: it shows the toast on the **rising edge** of `IsVisible` (false → true). The slide + fade animation plays, and if auto-dismiss is enabled the timer starts once the entrance animation finishes.

**Dismissing a toast** happens in one of three ways:

- **Timer** — after the configured number of seconds (when auto-dismiss > 0).
- **Swipe** — the user swipes the toast off-screen (when swipe to dismiss is enabled).
- **External** — your logic sets `IsVisible` back to **false**.

For the timer and swipe cases, the widget **writes `IsVisible` back to false itself**. In all three cases the **On dismiss** action runs.

> **Re-showing the toast:** because it is edge-triggered, `IsVisible` must actually return to **false** before it can be shown again. The widget handles this for its own dismissals (timer/swipe), so your logic only needs to set it true again. To update an already-visible toast, set `IsVisible` false, then true again — new attribute values **replace** the current toast; they are not queued.

## Styling — design properties

The widget exposes three Mendix **design properties**, merged on top of the built-in styling:

| Design property | Style type  | Applies to            |
| --------------- | ----------- | --------------------- |
| `container`     | `ViewStyle` | The toast card / banner |
| `header`        | `TextStyle` | The bold title text   |
| `body`          | `TextStyle` | The secondary line    |

Set these from your Native styling (JS theme / class), for example:

```js
export const com_freelie_widget_native_toastnotification_ToastNotification = {
    container: {
        borderRadius: 16
    },
    header: {
        fontSize: 14
    },
    body: {
        fontSize: 13
    }
};
```

Your overrides are merged **on top of** the built-in per-type background tint and layout, so you can adjust spacing, radius, and typography without losing the type theming.

## Notes & limitations

- **Native only.** The widget uses `react-native` `Animated` and `PanResponder`. It does **not** work on web / responsive pages — use it on Native pages.
- **One toast at a time.** There is no stacking or queueing. Setting new values replaces the current toast; multiple notifications do not enqueue.
- **Edge-triggered.** The toast shows on the false → true edge of `Visible`. To re-show, `Visible` must first return to false (the widget does this for its own timer/swipe dismissals).
- **`Visible` must be writable.** The widget calls `setValue(false)` on it during self-initiated dismissals; do not back it with a calculated or read-only attribute.
- **`On dismiss` fires for every dismiss reason.** Keep the handler idempotent.

## Development and contribution

1. Install dependencies:
   ```bash
   npm install
   ```
   If you are on **npm v7 or newer** (check with `npm -v`), use:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Run the watch build:
   ```bash
   npm start
   ```
   On every change the widget is bundled and the bundle is copied into the `dist` folder and into the Mendix test project under `tests/testProject`.
3. Other scripts:
   - `npm run build` — one-off production build.
   - `npm run lint` / `npm run lint:fix` — lint (and auto-fix) the source.
   - `npm run release` — produce the distributable `.mpk` for the Mendix Marketplace.

Requires **Node.js 20+**.

## License

Apache-2.0 — © Freelie BV 2026.
