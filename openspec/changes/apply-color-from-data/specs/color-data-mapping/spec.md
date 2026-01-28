## ADDED Requirements

### Requirement: Detect HEX color format
The system SHALL detect HEX color values in JSON data when the string matches the pattern `#` followed by 3, 6, or 8 hexadecimal characters.

#### Scenario: 6-digit HEX color detected
- **WHEN** a JSON value is `"#FF5733"`
- **THEN** the system identifies it as a color value and applies it to the target layer

#### Scenario: 3-digit shorthand HEX color detected
- **WHEN** a JSON value is `"#F53"`
- **THEN** the system identifies it as a color value and applies it to the target layer

#### Scenario: 8-digit HEX with alpha detected
- **WHEN** a JSON value is `"#FF573380"`
- **THEN** the system identifies it as a color value and applies it with the alpha channel to the paint opacity

#### Scenario: Invalid HEX format ignored
- **WHEN** a JSON value is `"#GGG"` or `"#12345"` (invalid hex)
- **THEN** the system does not treat it as a color and falls back to text handling

### Requirement: Detect RGB color format
The system SHALL detect RGB color values in JSON data when the string matches `rgb(` or `rgba(` function syntax.

#### Scenario: RGB color detected
- **WHEN** a JSON value is `"rgb(255, 87, 51)"`
- **THEN** the system identifies it as a color value and applies it to the target layer

#### Scenario: RGBA color with alpha detected
- **WHEN** a JSON value is `"rgba(255, 87, 51, 0.5)"`
- **THEN** the system identifies it as a color value and applies it with opacity

#### Scenario: Malformed RGB ignored
- **WHEN** a JSON value is `"rgb(999, 999, 999)"` or `"rgb(abc)"`
- **THEN** the system logs a warning and does not apply the color

### Requirement: Detect HSL color format
The system SHALL detect HSL color values in JSON data when the string matches `hsl(` or `hsla(` function syntax.

#### Scenario: HSL color detected
- **WHEN** a JSON value is `"hsl(14, 100%, 60%)"`
- **THEN** the system identifies it as a color value and applies it to the target layer

#### Scenario: HSLA color with alpha detected
- **WHEN** a JSON value is `"hsla(14, 100%, 60%, 0.5)"`
- **THEN** the system identifies it as a color value and applies it with opacity

### Requirement: Apply color to layer fills
The system SHALL apply detected color values to the fill property of target layers using `figma.util.solidPaint()`.

#### Scenario: Color applied to rectangle fill
- **WHEN** a color value `"#FF5733"` is mapped to a layer named "background"
- **AND** the layer supports fills
- **THEN** the layer's fill is set to a solid paint with color RGB(255, 87, 51)

#### Scenario: Color applied to frame fill
- **WHEN** a color value is mapped to a FRAME layer
- **THEN** the frame's background fill is updated to the specified color

#### Scenario: Layer without fill support skipped
- **WHEN** a color value is mapped to a layer that does not support fills (e.g., a GROUP)
- **THEN** the system logs a warning and skips the fill application

### Requirement: Apply color to layer strokes
The system SHALL apply detected color values to the stroke property of target layers when strokes exist.

#### Scenario: Color applied to existing stroke
- **WHEN** a color value `"#333333"` is mapped to a layer with an existing stroke
- **THEN** the layer's stroke color is updated to the specified color

#### Scenario: No stroke created when none exists
- **WHEN** a color value is mapped to a layer without any strokes
- **THEN** the system applies the color to fills only and does not create a new stroke

### Requirement: Detection order precedence
The system SHALL check values for color patterns AFTER URL detection but BEFORE text application.

#### Scenario: URL takes precedence over color-like string
- **WHEN** a JSON value is `"https://example.com/#section"`
- **THEN** the system treats it as a URL, not a color

#### Scenario: Color takes precedence over text
- **WHEN** a JSON value is `"#FF5733"` mapped to a TEXT layer
- **THEN** the system applies it as a fill color, not as text content

### Requirement: Graceful validation failure
The system SHALL handle invalid color strings gracefully without stopping other mappings.

#### Scenario: Invalid color logged but processing continues
- **WHEN** a JSON value appears to be a color but fails validation (e.g., `"rgb(300, 300, 300)"`)
- **THEN** the system logs a warning message
- **AND** continues processing remaining mappings

#### Scenario: Error message includes layer context
- **WHEN** a color application fails
- **THEN** the warning message includes the layer name and the invalid value for debugging

### Requirement: Color application logging
The system SHALL log successful color applications for user feedback.

#### Scenario: Fill application logged
- **WHEN** a color is successfully applied to a layer's fill
- **THEN** the system logs an info message indicating the color and layer name

#### Scenario: Stroke application logged
- **WHEN** a color is successfully applied to a layer's stroke
- **THEN** the system logs an info message indicating the stroke color update
