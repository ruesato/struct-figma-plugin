# Local Images Feature - Debugging Log

**Date**: January 27-28, 2026
**Feature**: Support for loading local image files from user's file system

## Overview

Implemented a feature to allow users to select local image files from their file system and apply them to Figma layers, as an alternative to using URLs. This involved UI components, file handling, state management, and communication between the UI and main thread.

---

## Issues Encountered & Solutions

### 1. File Picker Button Not Visible

**Issue**: Users couldn't see the FolderOpen button to select images.

**Root Cause**:
- Button only appears when JSON data contains values that match local image filename patterns
- Detection function checks for non-URL strings ending with image extensions

**Solution**:
- Created utility function `hasLocalImageValues()` that checks if JSON data contains local image filenames
- Button renders conditionally: `{hasLocalImages && (...)}`
- Uses pattern: NOT starting with `http://` or `https://` AND ending with `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

**Code Location**: `ui/src/components/KeyMapping.tsx:72-115`

---

### 2. TypeScript Import Errors

**Issue**:
```
Module '"../utils"' has no exported member 'hasLocalImageValues'
```

**Root Cause**:
- Two files existed: `ui/src/utils.ts` and `ui/src/utils/index.ts`
- Import `from '../utils'` resolved to `utils.ts` instead of `utils/index.ts`

**Solution**:
- Changed import to explicit path: `from '../utils/index'`
- Added `export type { LogContext }` for TypeScript isolatedModules compliance

**Commits**:
- `dfcd94d` - Fix TypeScript errors for local image feature

---

### 3. Directory Selection Not Working

**Issue**: File picker only allowed selecting individual files, not directories.

**Root Cause**:
- Missing `webkitdirectory` and `directory` attributes on file input
- React JSX doesn't support these non-standard attributes directly

**Solution**:
- Set attributes programmatically via ref callback:
```typescript
ref={(el) => {
  if (el) {
    fileInputRefs.current[mapping.jsonKey] = el;
    el.setAttribute('webkitdirectory', '');
    el.setAttribute('directory', '');
  }
}}
```

**Commit**: `faba66f` - Enable directory selection for local images

---

### 4. Images Not Being Applied + 403 Errors

**Issues**:
1. Non-image URLs being treated as images, causing 403 errors
2. Local images not being applied even when files were selected

**Root Causes**:
1. Code was treating ANY URL as an image URL (including `https://example.com/page#section`)
2. File paths from directory selection included parent paths but JSON only had basenames
3. Extension mismatch: `.jpeg` files vs `.jpg` in JSON

**Solutions**:

#### 4a. URL Validation
Created `isImageUrl()` helper that only returns true for URLs ending with image extensions:
```typescript
function isImageUrl(value: string): boolean {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return false;
  }
  const urlWithoutQueryOrHash = value.split('?')[0].split('#')[0];
  const lowerValue = urlWithoutQueryOrHash.toLowerCase();
  return lowerValue.endsWith('.png') || lowerValue.endsWith('.jpg') || ...;
}
```

#### 4b. Basename Extraction
Used `getBasename()` to extract just the filename from full paths:
```typescript
const basename = getBasename(file.name); // "folder/photo.jpg" → "photo.jpg"
```

#### 4c. Extension Normalization
Normalized `.jpeg` → `.jpg` on both UI side (storage) and main thread (lookup):
```typescript
basename = basename.replace(/\.jpeg$/i, '.jpg');
```

#### 4d. Check Order
Reordered value type checks to prevent conflicts:
1. Local image filenames (check first)
2. Color values
3. Image URLs (only if matches image extension)
4. Text values

**Commits**:
- `00bd0f5` - Fix local image application and URL handling issues

---

### 5. Only 1 File Loading Out of 10

**Issue**: File picker received 10 files but only 1 was being loaded and stored.

**Root Cause**: Unknown - loop appeared correct but stopped after first file.

**Hypotheses**:
1. Silent error in async loop breaking iteration
2. File reading failing for certain files (system files, hidden files)
3. Directory containing non-image files causing issues

**Solutions Implemented**:

#### 5a. Error Handling in Loop
Added try-catch inside the loop to prevent single file errors from breaking entire load:
```typescript
for (let i = 0; i < files.length; i++) {
  try {
    // Process file
  } catch (fileError) {
    // Log error and continue with next file
    console.error(`Error loading file "${file.name}":`, fileError);
    continue;
  }
}
```

#### 5b. Comprehensive Logging
Added detailed logging at every step:
- Before loop starts
- Each loop iteration with counter
- File name being processed
- Success/failure for each file
- Final summary

**Logging Output Expected**:
```
📁 Received 10 file(s) from picker: file1.jpg, file2.jpg, ...
🔄 Starting to process 10 files...
📄 Processing file 1/10: xray-rings-of-power-bonus-1.jpeg
⬇️ Reading xray-rings-of-power-bonus-1.jpeg...
✅ Loaded: xray-rings-of-power-bonus-1.jpg (117.7KB)
📄 Processing file 2/10: xray-rings-of-power-bonus-2.jpeg
...
🎉 Finished processing! 10 of 10 files loaded successfully
```

**Commits**:
- `ea71f6d` - Handle file loading errors and normalize jpeg extensions
- `fb35551` - Add visible Activity Log messages for file loading

---

## Architecture & Data Flow

### UI Side (`ui/src/`)

1. **State Management** (`App.tsx`):
   ```typescript
   const [localImageFiles, setLocalImageFiles] = useState<
     Record<string, Map<string, Uint8Array>>
   >({});
   // Structure: { "jsonKey": Map { "filename.jpg" => Uint8Array } }
   ```

2. **File Selection** (`components/KeyMapping.tsx`):
   - Hidden file input with directory attributes
   - FolderOpen icon button triggers file picker
   - Badge shows file count
   - X button clears selected files

3. **File Loading** (`App.tsx:handleLocalImageSelect`):
   - Read each file as ArrayBuffer
   - Convert to Uint8Array
   - Extract basename and normalize extensions
   - Store in Map keyed by filename

4. **Apply Data** (`App.tsx:handleApplyData`):
   - Convert Map to Record for JSON serialization
   - Include in `apply-data` message payload
   - Send to main thread via `SecureMessageHandler`

### Main Thread Side (`main/code.ts`)

1. **Message Handler**:
   - Receives `apply-data` message with optional `localImages` field
   - Passes to `applyDataToContainers()`

2. **Data Application Loop**:
   - For each container and mapping
   - Check if value is local image filename
   - Extract basename and normalize extension
   - Look up bytes in `localImages[jsonKey][basename]`
   - Call `applyImageFromBytes()` if found

3. **Image Creation**:
   ```typescript
   function applyImageFromBytes(node: SceneNode, bytes: Uint8Array) {
     const image = figma.createImage(bytes);
     node.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
   }
   ```

---

## Debugging Techniques Used

### 1. Console Logging
- **Browser console** vs **Plugin DevTools console** distinction
- Right-click in plugin UI → "Inspect Element" for correct DevTools
- Color-coded emoji prefixes: 🔵 (UI), 🟢 (apply data), 📦 (main thread)

### 2. Activity Log
- User-visible logging via `addLog()`
- Shows in plugin UI "Activity history"
- More accessible than browser console for users

### 3. Detailed Logging Strategy
```typescript
// Before operation
console.log('Starting operation with:', input);

// During operation (in loops)
console.log(`Processing item ${i+1}/${total}:`, item);

// After operation
console.log('Completed! Results:', results);

// On errors
console.error('Failed:', error);
```

### 4. State Inspection
```typescript
console.log('State before:', prevState);
console.log('State after:', newState);
```

---

## Lessons Learned

### 1. File API & Browser Limitations
- `webkitdirectory` is non-standard but widely supported
- Must be set as attribute, not React prop
- Directory selection gives FileList of all contained files (including subdirectories)

### 2. Async Loop Error Handling
- Always wrap individual iterations in try-catch for async loops
- One bad file shouldn't break entire batch
- Log each iteration for visibility

### 3. Extension Normalization
- `.jpg` and `.jpeg` are the same format but different extensions
- Normalize to single format for consistent matching
- Apply normalization on both storage and lookup sides

### 4. TypeScript Module Resolution
- Multiple `utils` files can cause import ambiguity
- Be explicit: `'../utils/index'` instead of `'../utils'`
- Use `export type` for type-only exports with `isolatedModules`

### 5. Value Type Checking Order
- Check most specific types first (local images)
- Then intermediate types (colors)
- Then generic types (URLs, text)
- Prevents generic checks from catching specific cases

### 6. Debugging Console Context
- Figma plugin UI runs in iframe
- Main Figma console ≠ Plugin UI console
- Must inspect plugin iframe specifically for UI logs

---

## File Locations

### Key Files Modified
- `ui/src/utils/index.ts` - Utility functions for image detection
- `ui/src/App.tsx` - State management and file loading
- `ui/src/components/KeyMapping.tsx` - File picker UI
- `main/code.ts` - Image application from bytes

### Debug Logging Added
- `ui/src/App.tsx:488-530` - File loading with progress
- `ui/src/App.tsx:590-610` - Apply data payload logging
- `main/code.ts:965-975` - Available images logging
- `main/code.ts:994-1012` - Image lookup with debugging

---

## Testing Checklist

When testing local images feature:

- [ ] File picker button appears when JSON contains local image filenames
- [ ] Button does NOT appear for URL-based image fields
- [ ] Directory selection works (not just individual files)
- [ ] Badge shows correct file count after selection
- [ ] Badge updates when selecting different directory
- [ ] Clear button removes files and hides badge
- [ ] Activity Log shows all files being loaded
- [ ] Images with `.jpeg` extension match JSON with `.jpg`
- [ ] Multiple images across multiple data items all applied correctly
- [ ] Non-image files in directory are skipped gracefully
- [ ] Error in one file doesn't prevent others from loading
- [ ] Non-image URLs don't trigger 403 errors

---

## Future Improvements

### Potential Enhancements
1. **Drag-and-drop support** for easier file selection
2. **Preview thumbnails** of selected images in UI
3. **Progress bar** for loading large numbers of files
4. **Subfolder handling** - option to include/exclude subdirectories
5. **Image optimization** - compress before storing in memory
6. **Memory management** - clear old images when loading new ones
7. **File size warnings** - alert if total size exceeds threshold

### Performance Considerations
- Current implementation loads all images into memory at once
- For large directories (100+ images), may cause memory issues
- Consider lazy loading or pagination for large datasets

---

## Related Issues (Beads)

Completed issues related to this feature:

- `struct-figma-plugin-751` - Utility Functions for Local Image Detection
- `struct-figma-plugin-4ya` - UI State Management for Local Images
- `struct-figma-plugin-ddd` - KeyMapping Component UI for File Picker
- `struct-figma-plugin-8fv` - Extend Apply Data Message with Local Images
- `struct-figma-plugin-doy` - Main Thread Image Handling from Bytes
- `struct-figma-plugin-2si` - Data Application Logic for Local Images
- `struct-figma-plugin-z30` - Testing and Validation for Local Images

---

## References

### Documentation
- [Figma Plugin API - createImage](https://www.figma.com/plugin-docs/api/figma/#createimage)
- [MDN - File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN - FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [HTML5 directory attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#directory)

### Example JSON Structure
```json
[
  {
    "name": "Item 1",
    "image": "photo-1.jpg"
  },
  {
    "name": "Item 2",
    "image": "photo-2.jpg"
  }
]
```

### Example Directory Structure
```
images/
  ├── photo-1.jpg
  ├── photo-2.jpg
  ├── photo-3.jpeg   (will match photo-3.jpg in JSON)
  ├── .DS_Store      (will be skipped)
  └── README.txt     (will be skipped)
```

---

**Status**: Implementation complete, debugging in progress for "only 1 file loading" issue.

**Last Updated**: January 28, 2026, 12:19 AM
