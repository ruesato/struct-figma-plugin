# Struct - Figma Plugin

A powerful Figma plugin that allows you to import JSON data and map it to layer properties in your designs. Perfect for populating designs with real data, creating data-driven prototypes, and automating content updates with complex, nested data structures.

## Features

- **Smart JSON Import**: Drag-and-drop or file picker support for JSON files (max 2MB)
  - Automatically detects and extracts arrays from wrapped objects (e.g., `{"patients": [...]}`)
  - Supports both direct arrays and nested object structures
- **Advanced Data Preview**: View the first 10 rows of your JSON data in a table format with nested key support
- **Intelligent Mapping**:
  - **Auto-populated defaults**: Key mappings automatically use smart layer names based on JSON keys
  - **Nested object support**: Handle complex data like `user.profile.name` or `encounters[].diagnosis`
  - **Array indexing**: Access specific array items with `encounters[0].encounter_id` or use `encounters[].encounter_id` for first item
- **Multiple Data Types**:
  - **Text layers**: Updates with string values from any nested level
  - **Image fills**: Fetches and applies images from URLs
  - **Component variants**: Updates variant properties with string values
- **Batch Processing**: Apply data to multiple selected instances at once
- **Real-time Logs**: See detailed progress, warnings, and errors with debug information
- **Client-side Only**: All processing happens locally, no backend required

## How to Use

1. **Install the Plugin**: Import the plugin into Figma using the manifest.json file
2. **Select Layers**: Choose one or more component instances or layers in your canvas
3. **Import JSON**:
   - Drag and drop a JSON file into the plugin sidebar, or
   - Click "Choose File" to browse for a JSON file
4. **Review Automatic Detection**: Check the logs to see how your JSON was parsed
   - The plugin automatically detects arrays in wrapped objects
   - Debug messages show the extraction process
5. **Preview Data**: Review the first 10 rows of your JSON data with all nested keys visible
6. **Review Smart Mappings**:
   - Each JSON key appears with an **auto-populated layer name**
   - Default names are intelligently chosen (e.g., `encounters[].diagnosis` → `diagnosis`)
   - Edit any mapping if your layer names differ
   - Leave empty to skip mapping for that key
7. **Apply Data**: Click "Apply Data to Selection" to update your layers

## JSON Data Format

The plugin intelligently handles various JSON formats:

### Direct Array Format
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar1.jpg",
    "profile": {
      "role": "Designer",
      "status": "Active"
    }
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatar": "https://example.com/avatar2.jpg",
    "profile": {
      "role": "Developer",
      "status": "Busy"
    }
  }
]
```

### Wrapped Array Format (Auto-detected)
```json
{
  "patients": [
    {
      "patient_id": "PAT-011",
      "first_name": "Daniel",
      "encounters": [
        {
          "encounter_id": "ENC-0064",
          "diagnosis": "Left Knee Pain",
          "provider_name": "Dr. Kim"
        }
      ]
    }
  ]
}
```
*The plugin automatically extracts the `patients` array and uses it as the data source.*

### Complex Nested Format
```json
{
  "users": [
    {
      "personal": {
        "name": "John Doe",
        "contact": {
          "email": "john@example.com",
          "phone": "+1-555-0123"
        }
      },
      "work": {
        "projects": [
          {
            "name": "Project Alpha",
            "status": "In Progress"
          }
        ]
      }
    }
  ]
}
```
*Supports deep nesting with keys like `personal.contact.email` and `work.projects[].status`*

## Mapping Examples

### Smart Default Mappings (Auto-populated)
- `patient_id` → `patient_id` *(simple key, used as-is)*
- `encounters[]` → `encounters` *(array, uses base name)*
- `encounters[].diagnosis` → `diagnosis` *(nested array, uses final property)*
- `personal.contact.email` → `email` *(nested object, uses final property)*

### Text Mapping
- JSON key: `name` → Figma layer: `name` *(auto-populated)*
- JSON key: `encounters[0].diagnosis` → Figma layer: `diagnosis` *(auto-populated)*
- JSON key: `profile.role` → Figma layer: `role` *(auto-populated, can be customized)*

### Image Mapping
- JSON key: `avatar` → Figma layer: `avatar` *(auto-populated)*
- JSON key: `patient.photo_url` → Figma layer: `photo` *(customized from default `photo_url`)*
- The plugin will fetch the image from the URL and apply it as a fill

### Variant Mapping
- JSON key: `profile.status` → Figma layer: `status` *(auto-populated for component variant property)*
- JSON key: `encounters[].encounter_type` → Figma layer: `type` *(customized from default `encounter_type`)*

### Array Access Patterns
- `encounters[0].provider_name` → Access first encounter's provider
- `encounters[1].diagnosis` → Access second encounter's diagnosis
- `encounters[].encounter_date` → Access first encounter's date (shorthand)
- `work.projects[].status` → Access first project's status

## File Structure

```
json-data-mapper/
├── manifest.json              # Plugin configuration
├── main/
│   ├── code.ts                # Main thread logic (source)
│   └── code.js                # Main thread logic (compiled)
├── ui/
│   ├── components/            # JSX React components
│   │   ├── App.jsx           # Main application component
│   │   ├── Header.jsx        # Plugin header
│   │   ├── ConfigSection.jsx # Configuration management
│   │   ├── DataSourceTabs.jsx# File/API/Manual data input
│   │   ├── JsonPreview.jsx   # JSON data preview table
│   │   ├── KeyMapping.jsx    # Key-to-layer mapping
│   │   ├── ValueBuilderModal.jsx # Custom value builder
│   │   ├── ActionSection.jsx # Apply data button
│   │   └── LogsSection.jsx   # Activity logs
│   ├── styles.css            # Tailwind CSS styles
│   ├── index.template.html   # HTML template
│   └── index.html            # Final UI (generated)
├── scripts/
│   ├── build-ui-jsx.ts       # JSX build script (active)
│   ├── build-ui.ts           # Legacy build script
│   └── *.js                  # Compiled build scripts
├── assets/                   # Test data files
├── .babelrc                  # Babel configuration for JSX
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build Plugin**:
   ```bash
   npm run build
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Build UI Only**:
   ```bash
   npm run build:ui
   ```

5. **Type Check**:
   ```bash
   npm run typecheck
   ```

### Development Workflow

**For UI changes:**
- Edit JSX components in `ui/components/` directory:
  - `App.jsx` - Main application logic and state
  - `Header.jsx` - Plugin header and title
  - `ConfigSection.jsx` - Save/load configuration functionality
  - `DataSourceTabs.jsx` - File/API/Manual data input tabs
  - `JsonPreview.jsx` - JSON data preview table
  - `KeyMapping.jsx` - JSON key to layer mapping interface
  - `ValueBuilderModal.jsx` - Custom value builder modal
  - `ActionSection.jsx` - Apply data button
  - `LogsSection.jsx` - Activity logs display
- Edit `ui/styles.css` for Tailwind CSS styling
- Run `npm run build:ui` to compile JSX and generate final `ui/index.html`

**For main thread changes:**
- Edit `main/code.ts`
- Run `npm run build` to compile

**Architecture Benefits:**
- **JSX Components**: Easy-to-edit HTML-like syntax instead of `React.createElement` calls
- **Modular Design**: Each UI section is a separate, focused component
- **Tailwind CSS**: Utility-first styling with custom Figma design tokens
- **Automated Build**: Babel compiles JSX → JavaScript, PostCSS processes Tailwind

**Note:** The final `ui/index.html` is generated during build and contains inlined CSS and JavaScript for optimal plugin performance.

## Technical Details

- **Framework**: TypeScript, React (via CDN), Tailwind CSS v3, Figma Plugin API
- **Architecture**:
  - Main thread: `main/code.ts` (source) → `main/code.js` (compiled) - Handles Figma API operations
  - UI thread: JSX components → compiled to `ui/index.html` - Modular React app for user interface
- **Build System**:
  - **JSX Compilation**: Babel transforms JSX components to React.createElement calls
  - **CSS Processing**: PostCSS processes Tailwind CSS with custom Figma design tokens
  - **Component Architecture**: 8 modular JSX components for maintainable UI development
- **Processing**: Client-side only, no external dependencies
- **File Size**: Maximum 2MB JSON files
- **JSON Parsing**:
  - Smart array detection (handles wrapped arrays like `{"data": [...]}`)
  - Nested object traversal up to 3 levels deep
  - Array indexing with bracket notation (`array[0].property`)
- **Data Mapping**: Auto-populated smart defaults based on JSON key structure
- **Image Support**: Fetches images from HTTP/HTTPS URLs with error handling
- **Key Path Support**:
  - Dot notation: `user.profile.name`
  - Array notation: `encounters[0].diagnosis` or `encounters[].diagnosis`
  - Mixed notation: `patient.encounters[].provider_name`

## Error Handling

The plugin includes comprehensive error handling for:
- Invalid JSON files
- Missing layer names
- Failed image downloads
- Network errors
- Invalid variant properties

All errors and warnings are displayed in the logs section of the plugin sidebar.

## Browser Compatibility

The plugin uses modern JavaScript features and requires:
- ES2020 support
- Fetch API
- File API
- Drag and Drop API

This should work in all modern browsers that support Figma.
