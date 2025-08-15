# JSON Data Mapper - Developer Reference

## Quick Start Context

This Figma plugin enables importing JSON data and mapping it to Figma layer properties. It handles complex nested data structures, arrays, and automatically provides intelligent layer name suggestions.

### Current State (as of latest update)
- ✅ Nested object support with array handling
- ✅ Smart JSON parsing (auto-detects wrapped arrays)
- ✅ Auto-populated mapping defaults
- ✅ Array indexing with bracket notation
- ✅ Debug logging for troubleshooting

## Architecture Overview

### File Structure
```
json-data-mapper/
├── manifest.json          # Plugin configuration & permissions
├── main/
│   ├── code.ts            # Main thread logic (TypeScript source)
│   └── code.js            # Compiled main thread code (loaded by Figma)
├── ui/
│   ├── ui.tsx             # 🔥 React components (TypeScript source)
│   ├── ui.css             # 🔥 Styles (CSS source)
│   ├── index.template.html # HTML template for build process
│   ├── ui.js              # Compiled React code (generated)
│   └── index.html         # Final UI with inlined CSS/JS (generated)
├── scripts/
│   ├── build-ui.ts        # Build script source
│   └── build-ui.js        # Compiled build script
├── assets/               # Test data files
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── build outputs...
```

### ✨ New Improved Architecture
**The plugin now uses proper separation of concerns with a build process:**
- **UI changes**: Edit `ui/ui.tsx` for React components
- **Style changes**: Edit `ui/ui.css` for styles
- **Build process**: Compiles and inlines everything into `ui/index.html`
- **Main thread changes**: Edit `main/code.ts` → compiles to `main/code.js`
- **Better DX**: Full TypeScript support, proper IDE features, maintainable code

### Communication Flow
```
Figma Canvas Selection → Main Thread (code.ts) → UI Thread (index.html) → User Interaction → Main Thread → Figma API
```

## Core Components

### 1. JSON Parsing Logic (`ui/index.html` lines 365-393)

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
```bash
# ✨ NEW: Edit separate TypeScript and CSS files
vim ui/ui.tsx     # React components with full TypeScript support
vim ui/ui.css     # Styles with proper CSS syntax highlighting

# Build UI (compiles TypeScript and inlines everything)
npm run build:ui  # Creates final ui/index.html

# TypeScript changes (main thread)
vim main/code.ts
npm run build     # Full build: compiles main + UI

# Testing
# Load plugin in Figma and test with assets/syntheticData-imaging-1.json
```

### Build Process Details
The build process (`scripts/build-ui.ts`) performs these steps:
1. **Compile TypeScript**: `ui/ui.tsx` → `ui/ui.js`
2. **Read source files**: CSS from `ui/ui.css`, compiled JS from `ui/ui.js`
3. **Process JavaScript**: Remove imports/exports, adapt for CDN React
4. **Inject content**: CSS and JS into `ui/index.template.html`
5. **Generate final**: Creates `ui/index.html` with everything inlined

### Benefits of New Architecture
- **🎯 Better IDE support**: Full TypeScript intellisense and error checking
- **🎨 Proper syntax highlighting**: CSS and TypeScript in separate files
- **🔧 Easier maintenance**: Logical separation of concerns
- **📦 Optimized output**: Single HTML file for Figma plugin requirements
- **🚀 Faster development**: Hot reloading with `npm run dev`

### Available Build Commands
```bash
npm run build       # Full build: compiles main + UI, creates final plugin
npm run build:ui    # UI only: compiles ui/ui.tsx and creates ui/index.html
npm run build:main  # Main only: compiles main/code.ts → main/code.js
npm run dev         # Watch mode for development (main thread only)
npm run typecheck   # Type checking without compilation
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

## Future Enhancement Ideas

### High Priority
- [ ] Support for deeper nesting (>3 levels)
- [ ] Custom array index selection in UI
- [ ] Bulk layer name detection from selection
- [ ] Undo/redo for data application

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