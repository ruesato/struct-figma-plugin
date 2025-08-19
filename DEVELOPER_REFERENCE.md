# Struct - Developer Reference

## Quick Start Context

This Figma plugin enables importing JSON data and mapping it to Figma layer properties. It handles complex nested data structures, arrays, and automatically provides intelligent layer name suggestions.

### Current State (as of latest update)
- ✅ JSX Component Architecture (modular UI development)
- ✅ Tailwind CSS v3 styling system with Figma design tokens
- ✅ Configuration persistence with Figma's clientStorage API
- ✅ Value Builder system for custom field combinations
- ✅ Nested object support with array handling
- ✅ Smart JSON parsing (auto-detects wrapped arrays)
- ✅ Auto-populated mapping defaults
- ✅ Array indexing with bracket notation
- ✅ Debug logging for troubleshooting

## Architecture Overview

### File Structure
```
json-data-mapper/
├── manifest.json              # Plugin configuration & permissions
├── main/
│   ├── code.ts                # Main thread logic (TypeScript source)
│   └── code.js                # Compiled main thread code (loaded by Figma)
├── ui/
│   ├── components/            # 🚀 JSX React components (modular architecture)
│   │   ├── App.jsx           # Main application component with state management
│   │   ├── Header.jsx        # Plugin header and title
│   │   ├── ConfigSection.jsx # Configuration save/load management
│   │   ├── DataSourceTabs.jsx# File/API/Manual data input tabs
│   │   ├── JsonPreview.jsx   # JSON data preview table
│   │   ├── KeyMapping.jsx    # JSON key to layer name mapping interface
│   │   ├── ValueBuilderModal.jsx # Custom value builder modal
│   │   ├── ActionSection.jsx # Apply data button
│   │   └── LogsSection.jsx   # Activity logs display
│   ├── styles.css            # 🎨 Tailwind CSS with Figma design tokens
│   ├── index.template.html   # HTML template for build process
│   └── index.html            # Final UI with inlined CSS/JS (generated)
├── scripts/
│   ├── build-ui-jsx.ts       # 🔥 JSX build script (active)
│   ├── build-ui.ts           # Legacy build script
│   └── *.js                  # Compiled build scripts
├── assets/                   # Test data files
├── .babelrc                  # Babel configuration for JSX compilation
├── tailwind.config.js        # Tailwind CSS configuration with custom tokens
├── postcss.config.js         # PostCSS configuration
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── build outputs...
```

### ✨ JSX Component Architecture
**The plugin now uses a modern JSX component architecture with advanced build tooling:**

#### Component-Based Development
- **Modular JSX Components**: 8 focused components in `ui/components/`
- **Easy Markup Editing**: Natural HTML-like JSX syntax instead of `React.createElement` calls
- **Logical Separation**: Each component handles a specific UI concern
- **Maintainable Code**: Clear component boundaries and props interface

#### Advanced Build System
- **JSX Compilation**: Babel transforms JSX → React.createElement calls
- **CSS Processing**: PostCSS processes Tailwind CSS with custom Figma design tokens
- **Automated Pipeline**: Single command builds entire UI from source components
- **Development Optimization**: Fast iteration with modular component editing

#### Modern Styling
- **Tailwind CSS v3**: Utility-first CSS framework with custom design system
- **Figma Design Tokens**: Colors, spacing, and typography matching Figma's UI
- **Component Classes**: Reusable Tailwind component classes (e.g., `.btn-primary`)
- **Consistent Theming**: Unified visual language across all UI components

#### Enhanced Developer Experience
- **Better IDE Support**: Full JSX/TypeScript intellisense and error checking
- **Syntax Highlighting**: Proper syntax highlighting for JSX and CSS
- **Hot Development**: Easy component editing with instant build feedback
- **Type Safety**: TypeScript types for component props and state

### Communication Flow
```
Figma Canvas Selection → Main Thread (code.ts) → UI Thread (index.html) → User Interaction → Main Thread → Figma API
```

## Core Components

### 1. JSX Component Architecture (`ui/components/`)

**Component Overview:**
```jsx
// App.jsx - Main component orchestrating everything
const App = () => {
  // All state management and callback functions
  const [jsonData, setJsonData] = useState(null);
  // ... other state

  return (
    <div className="p-4 max-w-full font-sans">
      <Header selectionCount={selectionCount} jsonData={jsonData} />
      <ConfigSection savedConfigs={savedConfigs} />
      <DataSourceTabs dataSource={dataSource} />
      {jsonData && (
        <>
          <JsonPreview jsonData={jsonData} />
          <KeyMapping mappings={mappings} />
          <ActionSection handleApplyData={handleApplyData} />
        </>
      )}
      <ValueBuilderModal />
      <LogsSection logs={logs} />
    </div>
  );
};
```

**Key Benefits:**
- **Maintainable**: Each component has a single responsibility
- **Reusable**: Components accept props and can be easily modified
- **Readable**: JSX syntax is much cleaner than React.createElement calls
- **IDE-Friendly**: Full IntelliSense support for JSX and props

### 2. JSON Parsing Logic (App.jsx functions injection)

**Smart Array Detection:**
```javascript
// Handles these cases:
// 1. Direct array: [{"name": "John"}, ...]
// 2. Wrapped array: {"users": [{"name": "John"}, ...]}
// 3. Single object: {"name": "John"}

if (Array.isArray(parsed)) {
  dataArray = parsed; // Direct array
} else if (typeof parsed === 'object' && parsed !== null) {
  const keys = Object.keys(parsed);
  if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
    dataArray = parsed[keys[0]]; // Extract from wrapper
  } else {
    // Find any array property or wrap single object
    const arrayProperty = keys.find(key => Array.isArray(parsed[key]));
    dataArray = arrayProperty ? parsed[arrayProperty] : [parsed];
  }
}
```

### 2. Key Extraction (`extractJsonKeys` function)

**Recursive Key Discovery:**
```javascript
// Extracts keys like:
// - "name" (simple)
// - "profile.role" (nested object)
// - "encounters[0].diagnosis" (array with index)
// - "encounters[].diagnosis" (array generic)

function extractKeysRecursive(obj, prefix = '', depth = 0) {
  // Traverses up to maxDepth=3 levels
  // For arrays: examines first 3 items and creates both indexed and generic paths
  if (Array.isArray(obj[key])) {
    arrayItems.forEach((item, index) => {
      extractKeysRecursive(item, `${fullKey}[${index}]`, depth + 1);
      extractKeysRecursive(item, `${fullKey}[]`, depth + 1);
    });
  }
}
```

### 3. Smart Default Layer Names (`getDefaultLayerName` function)

**Intelligent Name Generation:**
```javascript
// Examples:
// "encounters[0].encounter_id" → "encounter_id"
// "encounters[]" → "encounters"
// "user.profile.name" → "name"
// "status" → "status"

function getDefaultLayerName(jsonKey) {
  if (jsonKey.includes('[') && jsonKey.includes('.')) {
    return jsonKey.split('.').pop(); // Final property for arrays
  }
  if (jsonKey.includes('[')) {
    return jsonKey.split('[')[0]; // Base name for arrays
  }
  if (jsonKey.includes('.')) {
    return jsonKey.split('.').pop(); // Final property for objects
  }
  return jsonKey; // Simple keys as-is
}
```

### 4. Value Resolution (`getNestedValue` function)

**Path Traversal with Array Support:**
```javascript
// Handles paths like:
// - "name" → obj.name
// - "profile.role" → obj.profile.role
// - "encounters[0].diagnosis" → obj.encounters[0].diagnosis
// - "encounters[].diagnosis" → obj.encounters[0].diagnosis

const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
if (arrayMatch) {
  const [, arrayKey, index] = arrayMatch;
  const arrayValue = current[arrayKey];
  return index === '' ? arrayValue[0] : arrayValue[parseInt(index)];
}
```

## Data Application Pipeline

### Main Thread Processing (`main/code.ts`)

1. **Layer Discovery:** `findLayerByName()` recursively searches component hierarchies
2. **Data Type Detection:** Determines if value is text, image URL, or variant property
3. **Application Logic:**
   - **Text layers:** `applyTextContent()` with font loading
   - **Image fills:** `applyImageFromUrl()` with network fetching
   - **Component variants:** `applyVariantProperty()` with property matching

### Error Handling Strategy

**Comprehensive logging system:**
- `sendLog()` function bridges main thread → UI thread
- Categories: 'info', 'warning', 'error'
- Real-time display in plugin sidebar
- Debug messages for JSON parsing process

## Development Workflow

### Making UI Changes

#### JSX Component Development
```bash
# 🚀 Edit individual JSX components for specific features
vim ui/components/Header.jsx          # Plugin header and title
vim ui/components/ConfigSection.jsx   # Configuration save/load
vim ui/components/DataSourceTabs.jsx  # File/API/Manual input tabs
vim ui/components/JsonPreview.jsx     # Data preview table
vim ui/components/KeyMapping.jsx      # Key-to-layer mapping
vim ui/components/ValueBuilderModal.jsx # Custom value builder
vim ui/components/ActionSection.jsx   # Apply data button
vim ui/components/LogsSection.jsx     # Activity logs
vim ui/components/App.jsx             # Main orchestrating component

# 🎨 Edit Tailwind CSS styling
vim ui/styles.css                     # Custom component classes and styles

# 🔨 Build UI (compiles JSX with Babel, processes CSS with PostCSS)
npm run build:ui                      # Creates final ui/index.html

# 🔧 TypeScript changes (main thread)
vim main/code.ts
npm run build                         # Full build: compiles main + UI
```

#### JSX Build Process Details
The JSX build process (`scripts/build-ui-jsx.ts`) performs these steps:
1. **Compile JSX**: Babel transforms `ui/components/*.jsx` → React.createElement calls
2. **Combine Components**: Merge all compiled component files
3. **Function Injection**: Insert callback functions into App component via placeholder
4. **Process CSS**: PostCSS processes Tailwind CSS with custom Figma design tokens
5. **Template Integration**: Inject CSS and JS into `ui/index.template.html`
6. **Generate Final**: Creates `ui/index.html` with everything inlined and optimized

#### Architecture Benefits
- **🎯 Component-Based Development**: Edit individual JSX files instead of one massive file
- **🎨 Modern CSS**: Tailwind utility classes with custom Figma design system
- **🔧 Easy Maintenance**: Each component has clear boundaries and responsibilities
- **📦 Optimized Output**: Single HTML file for Figma plugin requirements
- **🚀 Fast Development**: Quick component iteration with focused editing
- **🛠️ Advanced Tooling**: Babel JSX compilation + PostCSS processing pipeline

#### Available Build Commands
```bash
npm run build       # Full build: compiles main + UI with JSX system
npm run build:ui    # UI only: compiles JSX components and creates ui/index.html
npm run build:main  # Main only: compiles main/code.ts → main/code.js
npm run dev         # Watch mode for development (main thread only)
npm run typecheck   # Type checking without compilation
```

#### JSX Component Editing Examples
```jsx
// Before: Hard to edit React.createElement calls
React.createElement('button', {
  className: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
  onClick: handleClick
}, 'Apply Data')

// After: Easy-to-edit JSX syntax
<button
  className="btn-primary"
  onClick={handleClick}
>
  Apply Data
</button>
```

### Testing Strategy
1. **Simple data:** Single object `{"name": "John"}`
2. **Array data:** Direct array `[{}, {}]`
3. **Wrapped data:** `{"users": [{}]}` (medical data example)
4. **Nested data:** Multi-level objects with arrays
5. **Edge cases:** Empty arrays, null values, missing properties

## Key Implementation Details

### Array Indexing Patterns
```javascript
// Generated keys for array data:
"encounters"           // Array itself
"encounters[0]"        // First item
"encounters[1]"        // Second item
"encounters[]"         // Generic first item access
"encounters[0].diagnosis"  // Specific property
"encounters[].diagnosis"   // First item property
```

### Memory & Performance
- **File limit:** 2MB JSON max
- **Preview limit:** First 10 data items displayed
- **Key limit:** First 10 keys displayed in preview table
- **Depth limit:** 3 levels of nesting for key extraction
- **Array sampling:** First 3 array items examined for key discovery

### Network Operations
- **Image fetching:** Async with timeout handling
- **Error recovery:** Failed images logged but don't stop processing
- **CORS handling:** Relies on Figma's network permissions

## Common Issues & Solutions

### Issue: Plugin shows old behavior after changes
**Cause:** Browser/Figma caching compiled files
**Solution:**
1. Close and reopen plugin
2. Hard refresh Figma (Cmd+Shift+R)
3. Clear browser cache if using web version

### Issue: "Only seeing 1 object" with array data
**Cause:** JSON has wrapper object (e.g., `{"patients": [...]}`)
**Solution:** ✅ Now auto-detected and extracted

### Issue: Keys not showing for nested arrays
**Cause:** Nested array items weren't being traversed
**Solution:** ✅ Now handles `encounters[].diagnosis` pattern

### Issue: Layer mappings are tedious to set up
**Cause:** All mappings started empty
**Solution:** ✅ Now auto-populated with smart defaults

## Test Data Reference

### Medical Records (syntheticData-imaging-1.json)
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

**Generated keys:**
- `patient_id` → `patient_id`
- `first_name` → `first_name`
- `encounters[].encounter_id` → `encounter_id`
- `encounters[].diagnosis` → `diagnosis`

## Recent Major Improvements

### ✅ JSX Component Architecture (Completed)
- **Modular Components**: Split monolithic UI into 8 focused JSX components
- **Developer Experience**: Easy HTML-like syntax instead of complex React.createElement calls
- **Build System**: Automated Babel compilation with JSX → JavaScript transformation
- **Maintainability**: Clear separation of concerns with component-based architecture

### ✅ Tailwind CSS Integration (Completed)
- **Modern Styling**: Migrated from 748 lines of custom CSS to Tailwind utility classes
- **Design System**: Custom Figma design tokens for consistent theming
- **PostCSS Pipeline**: Automated CSS processing with Tailwind compilation
- **Component Classes**: Reusable `.btn-primary`, `.form-input` style components

### ✅ Configuration Persistence (Completed)
- **Figma Storage**: Save/load configurations using Figma's clientStorage API
- **State Management**: Configurations persist across plugin sessions
- **UI Integration**: Save/Load/Delete configuration interface in ConfigSection component

### ✅ Value Builder System (Completed)
- **Custom Fields**: Build complex values combining JSON keys, text, and separators
- **Modal Interface**: Full-featured value builder with drag-and-drop reordering
- **Live Preview**: Real-time preview of built values using actual data
- **Flexible Mapping**: Override simple key mappings with custom-built values

## Future Enhancement Ideas

### High Priority
- [ ] Support for deeper nesting (>3 levels)
- [ ] Custom array index selection in UI
- [ ] Bulk layer name detection from selection
- [ ] Undo/redo for data application
- [ ] API data source with authentication

### Medium Priority
- [ ] CSV import support
- [ ] Data validation rules
- [ ] Custom transformation functions
- [ ] Batch image optimization

### Low Priority
- [ ] External API integration
- [ ] Real-time data sync
- [ ] Advanced variant mapping
- [ ] Custom UI themes

## Debugging Checklist

When issues arise:

1. **Check logs section** - Debug messages show parsing process
2. **Verify JSON structure** - Use JSON validator
3. **Test with simple data** - Start with `[{"name": "test"}]`
4. **Check layer names** - Ensure they exist in selection
5. **Verify selection** - Plugin needs active layer selection
6. **Review console** - Browser dev tools for JS errors
7. **Clear cache** - Hard refresh if behavior seems stale

## API References

### Figma Plugin API Usage
- `figma.currentPage.selection` - Get selected layers
- `figma.loadFontAsync()` - Required before text updates
- `figma.createImage()` - For URL image loading
- `figma.ui.postMessage()` - Main → UI communication
- `parent.postMessage()` - UI → Main communication

### React Patterns (Embedded)
- Functional components with hooks
- `useState` for local state management
- `useCallback` for performance optimization
- `useEffect` for message listening
- Inline event handlers for file operations

---

*This document should provide sufficient context for any developer (human or AI) to quickly understand the plugin architecture and continue development effectively.*
