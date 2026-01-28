## Context

The Struct plugin currently applies data to Figma layers through a detection-based system in `main/code.ts`. The `applyDataToContainers` function iterates through mappings and applies values based on:
1. Layer type (TEXT nodes get text content)
2. Value format (URLs starting with `http://` or `https://` become images)
3. Instance properties (variant properties on component instances)

This change adds color detection to this existing pipeline, treating color strings as a new data type that maps to fill/stroke properties.

## Goals / Non-Goals

**Goals:**
- Detect HEX, RGB, and HSL color formats in JSON values automatically
- Apply colors to layer fills using `figma.util.solidPaint()`
- Apply colors to layer strokes when strokes exist on the target layer
- Maintain backward compatibility with existing text/image/variant mappings
- Provide clear logging when colors are applied or validation fails

**Non-Goals:**
- UI changes for explicit color mapping selection (auto-detection only)
- Gradient support (only solid colors)
- HSB/HSV format support (requires manual conversion, not natively supported)
- Named CSS colors like "red", "blue" (ambiguous, could conflict with text content)
- Opacity/alpha channel from color values (keep existing layer opacity)

## Decisions

### 1. Use `figma.util.solidPaint()` for color application

**Decision**: Use the native Figma utility rather than manually constructing `SolidPaint` objects.

**Rationale**:
- `figma.util.solidPaint()` handles HEX, RGB, and HSL parsing natively
- Throws clear errors for invalid formats, making validation straightforward
- Reduces code complexity and maintenance burden

**Alternative considered**: Manual regex parsing + RGB object construction. Rejected because it duplicates functionality Figma already provides and is more error-prone.

### 2. Detection order: URL → Color → Text

**Decision**: Check for color values AFTER URL detection but BEFORE text application.

**Rationale**:
- URLs are the most specific pattern (must start with `http://` or `https://`)
- Colors have recognizable patterns (`#`, `rgb(`, `hsl(`)
- Text is the fallback for any string value
- This prevents a color like `#FF5733` from being applied as text content

**Detection flow**:
```
value → is URL? → apply image
      → is color? → apply fill/stroke
      → is text layer? → apply text
      → is instance? → apply variant
```

### 3. Apply to both fills and strokes when applicable

**Decision**: When a color is detected, apply to fills always, and also apply to strokes if the layer has existing strokes.

**Rationale**:
- Fills are the primary use case (background colors, shape fills)
- Strokes are secondary but valuable (border colors, outlines)
- Only apply to strokes if they exist (don't create strokes where none exist)
- Users can remove strokes in Figma if they only want fill changes

**Alternative considered**: Separate layer name conventions (e.g., `layerName#fill` vs `layerName#stroke`). Rejected to keep the interface simple and auto-detected.

### 4. Validate before applying with try-catch

**Decision**: Wrap `figma.util.solidPaint()` in try-catch to handle invalid color strings gracefully.

**Rationale**:
- `figma.util.solidPaint()` throws for invalid inputs
- Graceful failure allows other mappings to continue processing
- Log warnings for invalid colors so users can fix their data

### 5. Color detection regex patterns

**Decision**: Use specific regex patterns to identify color values:
- HEX: `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/`
- RGB: `/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i`
- HSL: `/^hsla?\(\s*\d+/i`

**Rationale**:
- Patterns are specific enough to avoid false positives with regular text
- Match both 3-digit and 6-digit HEX (and 8-digit with alpha)
- Case-insensitive for RGB/HSL function names
- Don't require closing parenthesis in regex (let `solidPaint` validate fully)

## Risks / Trade-offs

**Risk: False positives with text that looks like colors**
→ Mitigation: Regex patterns require exact format matching. Random text like "rgb123" won't match because it lacks parentheses. HEX requires leading `#`.

**Risk: Performance impact from color detection on every value**
→ Mitigation: Regex tests are fast. Detection runs only for string values, and short-circuits on first match. No measurable impact expected.

**Risk: Users may want different fill vs stroke colors**
→ Trade-off: Current design applies same color to both. Users can manually adjust in Figma, or we can add explicit mapping types in a future iteration.

**Risk: Alpha/opacity handling inconsistency**
→ Trade-off: `figma.util.solidPaint()` extracts alpha to `opacity` property. We preserve existing layer opacity by not modifying it. Colors with alpha (like `#FF573380`) will have their alpha applied to the paint's opacity, which may override existing values. Document this behavior.
