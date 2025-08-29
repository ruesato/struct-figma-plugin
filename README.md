# Struct - Figma Plugin

A powerful Figma plugin that allows you to import JSON data and map it to layer properties in your designs. Perfect for populating designs with real data, creating data-driven prototypes, and automating content updates with complex, nested data structures.

## Features

### 🚀 **Enhanced User Experience**
- **Modal-Based Interface**: Clean, focused workflows with dedicated modals for different tasks
- **Smart Error Handling**: Immediate error notifications with user-friendly messages and technical details
- **Activity Log Management**: Full activity history with modal view and quick access
- **Configuration Management**: Save, load, and manage multiple plugin configurations
- **Professional Animations**: Smooth transitions and interactions powered by Framer Motion

### 📊 **Advanced Data Processing**
- **Smart JSON Import**: Drag-and-drop or file picker support for JSON files (max 2MB)
  - Automatically detects and extracts arrays from wrapped objects (e.g., `{"patients": [...]}`)
  - Supports both direct arrays and nested object structures
- **Advanced Data Preview**: View the first 10 rows of your JSON data in a table format with nested key support
- **Intelligent Mapping**:
  - **Auto-populated defaults**: Key mappings automatically use smart layer names based on JSON keys
  - **Nested object support**: Handle complex data like `user.profile.name` or `encounters[].diagnosis`
  - **Array indexing**: Access specific array items with `encounters[0].encounter_id` or use `encounters[].encounter_id` for first item

### 🎯 **Data Application**
- **Multiple Data Types**:
  - **Text layers**: Updates with string values from any nested level
  - **Image fills**: Fetches and applies images from URLs
  - **Component variants**: Updates variant properties with string values
- **Batch Processing**: Apply data to multiple selected instances at once
- **Value Builder System**: Create custom field combinations with drag-and-drop interface

### 🔐 **Enterprise-Grade Security**
- **Secure Network Access**: Wildcard domain support with user approval system
- **Session-Based Approval**: Secure domain access that resets between plugin sessions
- **Enhanced URL Validation**: HTTPS-only, private IP blocking, suspicious domain filtering
- **Rate Limiting**: 10 requests per hour per domain with security monitoring
- **Request Auditing**: Complete activity logging for security compliance

### 🛠️ **Professional Tools**
- **Configuration Persistence**: Save and reuse plugin settings across sessions
- **Error Toast System**: Immediate feedback for critical errors with severity levels
- **Comprehensive Logging**: Detailed activity log with technical information
- **Client-side Processing**: All operations happen locally, no backend required

## How to Use

### 🚀 **Quick Start**
1. **Install the Plugin**: Import the plugin into Figma using the manifest.json file
2. **Select Layers**: Choose one or more component instances or layers in your canvas
3. **Import JSON**:
   - Drag and drop a JSON file into the plugin sidebar, or
   - Click "Choose File" to browse for a JSON file
4. **Review Automatic Detection**: The plugin automatically detects and processes your JSON structure
5. **Preview Data**: Review your JSON data in the built-in table view
6. **Configure Mappings**: Auto-populated smart mappings connect JSON keys to layer names
7. **Apply Data**: Click "Apply Data to Selection" to update your layers

### ⚙️ **Advanced Features**

#### **Configuration Management**
- **Save Current Settings**: Click the green "Save Config" button in the header to save your current configuration
- **Load Configurations**: Click the settings gear icon to open the configuration modal
  - Select any saved configuration and click "Apply Configuration"
  - Delete individual configurations or clear all at once
  - View configuration details (data source, mappings count, save date)

#### **Activity Monitoring** 
- **Activity Log**: All plugin activities are logged with timestamps and severity levels
- **View All Activity**: Click "View All" button to open the full activity log modal
- **Error Notifications**: Critical errors appear as toast messages with quick access to details

#### **Error Handling**
- **Smart Error Detection**: The plugin identifies and categorizes different types of issues
- **Toast Notifications**: Critical errors display as dismissible toast messages at the top
- **Severity Levels**: Color-coded notifications (red=error, yellow=warning, orange=validation)
- **Technical Details**: Click "View technical details →" on any toast to open the activity log

#### **Value Builder System**
- **Custom Fields**: Build complex field values combining multiple JSON keys and custom text
- **Drag and Drop**: Reorder value parts with intuitive drag-and-drop interface
- **Live Preview**: See exactly how your custom values will appear using real data
- **Flexible Mapping**: Override simple mappings with sophisticated custom-built values

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
│   ├── components/            # Modern React components
│   │   ├── App.tsx           # Main application component
│   │   ├── Header.tsx        # Plugin header with config access
│   │   ├── DataSourceTabs.tsx# File/API/Manual data input
│   │   ├── JsonPreview.tsx   # JSON data preview table
│   │   ├── KeyMapping.tsx    # Key-to-layer mapping
│   │   ├── ValueBuilderModal.tsx # Custom value builder
│   │   ├── ActionSection.tsx # Apply data button
│   │   ├── LogsSection.tsx   # Activity logs with modal access
│   │   ├── ActivityLogModal.tsx # Full activity log modal
│   │   ├── ConfigurationModal.tsx # Configuration management modal
│   │   ├── SaveConfigurationModal.tsx # Save configuration modal
│   │   └── ErrorToast.tsx    # Error notification system
│   ├── styles.css            # Tailwind CSS styles
│   ├── index.template.html   # HTML template
│   └── index.html            # Final UI (generated)
├── scripts/
│   ├── build-ui-modern.js    # Modern build script with esbuild
│   ├── build-ui-jsx.ts       # JSX build script 
│   ├── build-ui.ts           # Legacy build script
│   └── *.js                  # Compiled build scripts
├── assets/                   # Test data files
├── .babelrc                  # Babel configuration
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
- Edit TypeScript components in `ui/components/` directory:
  - `App.tsx` - Main application logic and state management
  - `Header.tsx` - Plugin header with configuration and save buttons
  - `DataSourceTabs.tsx` - File/API/Manual data input tabs
  - `JsonPreview.tsx` - JSON data preview table
  - `KeyMapping.tsx` - JSON key to layer mapping interface
  - `ValueBuilderModal.tsx` - Custom value builder with drag-and-drop
  - `ActionSection.tsx` - Apply data button
  - `LogsSection.tsx` - Activity logs with modal access
  - `ActivityLogModal.tsx` - Full-featured activity log modal
  - `ConfigurationModal.tsx` - Configuration management modal
  - `SaveConfigurationModal.tsx` - Save configuration modal with preview
  - `ErrorToast.tsx` - Error notification toast system
- Edit `ui/styles.css` for Tailwind CSS styling
- Run `npm run build` to compile components and generate final `ui/index.html`

**For main thread changes:**
- Edit `main/code.ts`
- Run `npm run build` to compile

**Architecture Benefits:**
- **Modern Components**: TypeScript React components with proper type safety
- **Modular Design**: Each UI section is a separate, focused component with clear responsibilities
- **Professional UX**: Modal-based interface with smooth animations and error handling
- **Advanced Tooling**: Modern build system with esbuild for fast compilation
- **Configuration System**: Persistent settings with save/load functionality

**Note:** The final `ui/index.html` is generated during build and contains inlined CSS and JavaScript for optimal plugin performance. The modern build system uses esbuild for fast compilation and includes all necessary dependencies like Framer Motion for animations.

## Technical Details

### 🏗️ **Modern Architecture**
- **Framework**: TypeScript, React, Tailwind CSS v3, Framer Motion, Figma Plugin API
- **Architecture**:
  - Main thread: `main/code.ts` → `main/code.js` - Handles Figma API operations
  - UI thread: Modern React components with TypeScript - Professional UI with modal system
- **Build System**:
  - **Modern Bundling**: esbuild for fast compilation and bundling
  - **CSS Processing**: Tailwind CSS with custom Figma design tokens
  - **Component Architecture**: 11+ modular TypeScript components
  - **Animation System**: Framer Motion for smooth transitions and interactions

### 🎯 **Core Features**
- **Processing**: Client-side only, no external dependencies
- **File Size**: Maximum 2MB JSON files
- **JSON Parsing**:
  - Smart array detection (handles wrapped arrays like `{"data": [...]}`)
  - Nested object traversal up to 3 levels deep
  - Array indexing with bracket notation (`array[0].property`)
- **Data Mapping**: Auto-populated smart defaults based on JSON key structure
- **Image Support**: Fetches images from HTTP/HTTPS URLs with comprehensive error handling
- **Key Path Support**:
  - Dot notation: `user.profile.name`
  - Array notation: `encounters[0].diagnosis` or `encounters[].diagnosis`
  - Mixed notation: `patient.encounters[].provider_name`

### 🔧 **Advanced Systems**
- **Security Architecture**: Wildcard network access with session-based domain approval system
- **URL Validation Engine**: Multi-layer security with HTTPS enforcement and threat detection
- **Configuration Management**: Persistent settings using Figma's clientStorage API
- **Error Handling**: Multi-level error system with toast notifications and activity logging
- **Value Builder**: Drag-and-drop interface for creating custom field combinations
- **Modal Interface**: Dedicated modals for activity logs, configurations, and value building
- **State Management**: Centralized React state with optimized re-rendering
- **Animation Framework**: Smooth transitions and micro-interactions throughout the interface

## Error Handling

### 🚨 **Advanced Error Management System**

The plugin features a comprehensive error handling system with multiple notification levels:

#### **Error Toast Notifications**
- **Immediate Feedback**: Critical errors appear as toast messages at the top of the plugin
- **Severity Levels**: 
  - 🔴 **Error** (Red): Critical failures, network errors, plugin crashes
  - 🟡 **Warning** (Yellow): Non-critical issues that may impact functionality
  - 🟠 **Validation** (Orange): User input validation issues
- **Manual Dismissal**: Click the X button to dismiss individual toasts
- **Stacking Support**: Multiple errors stack vertically for visibility
- **Quick Access**: "View technical details →" link opens full activity log

#### **Comprehensive Error Coverage**
- **File Upload Issues**:
  - File too large (>2MB limit)
  - Invalid JSON parsing
  - Unsupported file formats
- **API and Network Errors**:
  - Network connectivity failures
  - Invalid API responses
  - Image download failures
- **Validation Errors**:
  - No data loaded
  - No field mappings configured
  - No Figma layers selected
  - Missing configuration names
- **Plugin and Storage Errors**:
  - Figma storage access issues
  - Data application failures
  - Unexpected plugin errors

#### **Activity Log System**
- **Complete History**: All activities, errors, and operations logged with timestamps
- **Technical Details**: Full error messages and stack traces for troubleshooting
- **Modal Interface**: Dedicated modal for viewing full activity history
- **User-Friendly Messages**: Toast notifications show simplified, actionable messages
- **Dual System**: Toast messages for immediate attention, activity log for detailed analysis

## Browser Compatibility

The plugin uses modern JavaScript features and requires:
- ES2020 support
- Fetch API
- File API
- Drag and Drop API

This should work in all modern browsers that support Figma.