## Why

The Struct plugin can apply text, images, and variant properties from JSON data to Figma layers, but designers frequently need to populate designs with dynamic color values (e.g., brand colors, status indicators, category colors, theming). Without color mapping support, designers must manually update fill and stroke colors after applying other data, breaking the automated workflow.

## What Changes

- Add color value detection to automatically identify HEX (`#FF5733`, `#F53`), RGB (`rgb(255, 87, 51)`), and HSL (`hsl(14, 100%, 60%)`) formats in JSON data
- Apply detected color values to layer **fill** properties using `figma.util.solidPaint()`
- Apply detected color values to layer **stroke** properties when the target layer has strokes
- Auto-detect color values during mapping application - no UI changes required for basic functionality
- Validate color strings before applying to prevent invalid paint objects

## Capabilities

### New Capabilities

- `color-data-mapping`: Parse and validate color values from JSON data (HEX, RGB, HSL formats) and apply them to Figma layer fill and stroke properties using the native `figma.util.solidPaint()` API.

### Modified Capabilities

(none - existing text, image, and variant mappings continue to work unchanged)

## Impact

- **main/code.ts**: Add color detection utility, color validation, and fill/stroke application logic in `applyDataToContainers`
- **No UI changes**: Auto-detection means existing mapping UI works as-is
- **No breaking changes**: Existing mappings continue to function; color detection is additive
- **Dependencies**: Uses built-in `figma.util.solidPaint()` - no new packages required
