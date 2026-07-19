# PocketPOS UI Cleanup Design

## Goal

Make the existing PocketPOS foundation easier to scan and operate without changing its monochrome identity or feature scope. The cleanup removes internal Expo Router names from visible headers, adds breathing room between related sections, and preserves compact phone usability.

## Approaches considered

1. **Token-led spacing cleanup — selected.** Extend the shared spacing scale and adjust existing screens and primitives. This keeps the visual language consistent and avoids new layout abstractions.
2. **Screen-by-screen overrides.** Tune each screen independently. This is faster initially but produces inconsistent gaps and makes later billing screens harder to align.
3. **Full component redesign.** Replace cards, fields, navigation, and typography together. This offers the most control but is unnecessary for the current congestion problem and would delay billing.

## Navigation

The root stack will explicitly configure routes. The tab navigator and setup route will hide the root stack header. Product create, detail, and edit routes will use concise human-readable titles rather than file-system route names such as `(tabs)` or `product/[id]`.

The tab bar remains black, white, and neutral. Its touch targets and safe-area behavior stay unchanged unless simulator inspection reveals clipping.

## Spacing and hierarchy

The shared spacing scale gains one larger token for page-level and section-level separation. Existing `Screen`, `Card`, `Field`, and `Button` primitives remain the source of layout consistency.

- Phone pages keep 24-point horizontal padding and gain clearer top and bottom breathing room.
- Forms use consistent field-group spacing and larger separation before submit actions.
- Cards keep rounded corners and neutral borders, with slightly clearer internal grouping.
- Screen headings separate title, supporting text, and actions without increasing visual decoration.
- Inventory rows and product-detail sections remain dense enough for fast counter use while no longer touching adjacent elements.

Tablet max-width behavior remains unchanged.

## Expo configuration hygiene

Accept Expo 57's generated TypeScript configuration so starting Metro does not dirty the working tree. Expo 57 removes the legacy `expo-env.d.ts` reference and normalizes the remaining includes. TypeScript, lint, and tests must pass with that generated configuration committed.

## Validation

Automated verification covers tests, TypeScript, lint, and Android export. Simulator inspection covers setup, inventory, product detail, settings, keyboard-safe scrolling, header labels, bottom navigation, and safe-area spacing.

After visual verification, the existing iPhone 15 screenshots will be replaced with the cleaned screens. The Expo Go development button may remain visible in development captures and is documented as such.

## Scope boundary

This cleanup does not add billing, receipts, analytics, backup, new colors, animation, gradients, or dependencies. Billing begins as the next implementation phase after this cleanup is committed.
