## 1. Color Detection Utilities

- [ ] 1.1 Add `isColorValue(value: string): boolean` function with regex patterns for HEX, RGB, and HSL detection
- [ ] 1.2 Add HEX pattern: `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/`
- [ ] 1.3 Add RGB pattern: `/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i`
- [ ] 1.4 Add HSL pattern: `/^hsla?\(\s*\d+/i`

## 2. Color Application Functions

- [ ] 2.1 Add `applyColorToFill(node: SceneNode, colorValue: string): boolean` function using `figma.util.solidPaint()`
- [ ] 2.2 Add `applyColorToStroke(node: SceneNode, colorValue: string): boolean` function for layers with existing strokes
- [ ] 2.3 Wrap `figma.util.solidPaint()` calls in try-catch for graceful validation failure
- [ ] 2.4 Add logging for successful fill application with layer name and color value
- [ ] 2.5 Add logging for successful stroke application
- [ ] 2.6 Add warning logging for invalid color values with layer context

## 3. Integration with applyDataToContainers

- [ ] 3.1 Add color detection check AFTER URL detection but BEFORE text application in the value handling flow
- [ ] 3.2 When color detected, call `applyColorToFill()` on the target layer
- [ ] 3.3 When color detected and layer has strokes, also call `applyColorToStroke()`
- [ ] 3.4 Skip text application when color is detected (color takes precedence over text content)

## 4. Testing

- [ ] 4.1 Create example JSON file with HEX, RGB, and HSL color values in `examples/`
- [ ] 4.2 Manual test: Apply 6-digit HEX color to rectangle fill
- [ ] 4.3 Manual test: Apply 3-digit shorthand HEX color
- [ ] 4.4 Manual test: Apply RGB color to frame background
- [ ] 4.5 Manual test: Apply HSL color to shape
- [ ] 4.6 Manual test: Verify stroke color updates when stroke exists
- [ ] 4.7 Manual test: Verify no stroke created when none exists
- [ ] 4.8 Manual test: Verify invalid color logs warning and continues processing
- [ ] 4.9 Manual test: Verify URL with hash fragment is not treated as color
