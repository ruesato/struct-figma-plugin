# JSON Data Mapper - Figma Plugin

A Figma plugin that allows you to import JSON data and map it to layer properties in your designs. Perfect for populating designs with real data, creating data-driven prototypes, and automating content updates.

## Features

- **JSON Import**: Drag-and-drop or file picker support for JSON files (max 2MB)
- **Data Preview**: View the first 10 rows of your JSON data in a table format
- **Flexible Mapping**: Map JSON keys (including nested keys) to Figma layer names
- **Multiple Data Types**: 
  - Text layers: Updates with string values
  - Image fills: Fetches and applies images from URLs
  - Component variants: Updates variant properties
- **Batch Processing**: Apply data to multiple selected instances at once
- **Real-time Logs**: See progress, warnings, and errors in the sidebar
- **Client-side Only**: All processing happens locally, no backend required

## How to Use

1. **Install the Plugin**: Import the plugin into Figma using the manifest.json file
2. **Select Layers**: Choose one or more component instances or layers in your canvas
3. **Import JSON**: 
   - Drag and drop a JSON file into the plugin sidebar, or
   - Click "Choose File" to browse for a JSON file
4. **Preview Data**: Review the first 10 rows of your JSON data
5. **Map Keys**: 
   - Each JSON key will appear with an input field
   - Enter the corresponding Figma layer name for each key you want to map
   - Leave empty to skip mapping for that key
6. **Apply Data**: Click "Apply Data to Selection" to update your layers

## JSON Data Format

The plugin supports both array and object formats:

### Array Format (Recommended)
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

### Object Format
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar1.jpg"
}
```

## Mapping Examples

### Text Mapping
- JSON key: `name` → Figma layer: `user-name`
- JSON key: `profile.role` → Figma layer: `role-text`

### Image Mapping
- JSON key: `avatar` → Figma layer: `profile-image`
- The plugin will fetch the image from the URL and apply it as a fill

### Variant Mapping
- JSON key: `profile.status` → Figma layer: `status` (for component variant property)

## File Structure

```
json-data-mapper/
├── manifest.json          # Plugin configuration
├── main/
│   └── code.ts            # Main thread logic
├── ui/
│   ├── index.html         # UI with embedded React
│   └── ui.tsx             # React components (reference)
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
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

4. **Type Check**:
   ```bash
   npm run typecheck
   ```

## Technical Details

- **Framework**: TypeScript, React (via CDN), Figma Plugin API
- **Processing**: Client-side only, no external dependencies
- **File Size**: Maximum 2MB JSON files
- **Image Support**: Fetches images from HTTP/HTTPS URLs
- **Nested Keys**: Supports dot notation (e.g., `user.profile.name`)

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