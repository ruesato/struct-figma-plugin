# Struct - Developer Reference

## Quick Start Context

This Figma plugin enables importing JSON data and mapping it to Figma layer properties. It handles complex nested data structures, arrays, and automatically provides intelligent layer name suggestions.

### Current State (as of latest update)
- ✅ Modern React + TypeScript Architecture with component-based development
- ✅ Professional UX with Modal-Based Interface (Activity Log, Configuration Management, Save Configuration)
- ✅ **Enterprise Security**: Wildcard network access with session-based domain approval system
- ✅ **Enhanced Security Validation**: HTTPS-only, private IP blocking, suspicious domain filtering
- ✅ **Rate Limiting & Monitoring**: 10 req/hour per domain with comprehensive request auditing
- ✅ Advanced Error Handling System with Toast Notifications and Activity Logging
- ✅ Fixed Activity History display with proper timestamp formatting and reverse chronological order
- ✅ Framer Motion Animations for smooth, professional user experience
- ✅ Tailwind CSS v3 styling system with Figma design tokens
- ✅ Configuration persistence with Figma's clientStorage API
- ✅ Value Builder system for custom field combinations
- ✅ Nested object support with array handling
- ✅ Smart JSON parsing (auto-detects wrapped arrays)
- ✅ Auto-populated mapping defaults
- ✅ Array indexing with bracket notation
- ✅ esbuild-powered modern build system for fast compilation

## Architecture Overview

### File Structure
```
json-data-mapper/
├── manifest.json              # Plugin configuration & permissions
├── main/
│   ├── code.ts                # Main thread logic (TypeScript source)
│   └── code.js                # Compiled main thread code (loaded by Figma)
├── ui/
│   ├── components/            # 🚀 Modern TypeScript React Components
│   │   ├── App.tsx           # Main application component with state management
│   │   ├── Header.tsx        # Plugin header with configuration and save access
│   │   ├── DataSourceTabs.tsx# File/API/Manual data input tabs
│   │   ├── JsonPreview.tsx   # JSON data preview table
│   │   ├── KeyMapping.tsx    # JSON key to layer name mapping interface
│   │   ├── ValueBuilderModal.tsx # Custom value builder modal
│   │   ├── ActionSection.tsx # Apply data button
│   │   ├── LogsSection.tsx   # Activity logs with modal access
│   │   ├── ActivityLogModal.tsx # 🆕 Full-featured activity log modal
│   │   ├── ConfigurationModal.tsx # 🆕 Configuration management modal
│   │   ├── SaveConfigurationModal.tsx # 🆕 Save configuration modal
│   │   └── ErrorToast.tsx    # 🆕 Error notification toast system
│   ├── styles.css            # 🎨 Tailwind CSS with Figma design tokens
│   ├── index.template.html   # HTML template for build process
│   └── index.html            # Final UI with inlined CSS/JS (generated)
├── scripts/
│   ├── build-ui-modern.js    # 🔥 Modern esbuild-powered build system (active)
│   ├── build-ui-jsx.ts       # Legacy JSX build script
│   ├── build-ui.ts           # Legacy build script
│   └── *.js                  # Compiled build scripts
├── assets/                   # Test data files
├── .babelrc                  # Babel configuration
├── tailwind.config.js        # Tailwind CSS configuration with custom tokens
├── postcss.config.js         # PostCSS configuration
├── package.json              # Dependencies & scripts (includes Framer Motion)
├── tsconfig.json             # TypeScript configuration
└── build outputs...
```

### ✨ Modern Component Architecture & UX System
**The plugin now features a professional, modal-based interface with advanced user experience:**

#### Professional Modal System
- **Activity Log Modal**: Dedicated modal for viewing complete plugin activity history
- **Configuration Modal**: Full-featured configuration management with load/delete capabilities
- **Save Configuration Modal**: Specialized modal for saving current settings with preview
- **Value Builder Modal**: Advanced drag-and-drop interface for custom field building
- **Error Toast System**: Non-blocking error notifications with severity levels

#### Advanced Error Handling
- **Multi-Level Error System**: Toast notifications + activity logging dual approach
- **Severity Classification**: Error (red), Warning (yellow), Validation (orange)
- **User-Friendly Messages**: Simplified messages in toasts, technical details in activity log
- **Immediate Feedback**: Critical errors appear instantly as dismissible toasts
- **Technical Access**: Quick link from toasts to full technical details

#### Enhanced State Management
- **Configuration Persistence**: Save/load plugin configurations using Figma clientStorage
- **Toast Management**: Stack multiple error notifications with smooth animations
- **Modal State**: Centralized management of all modal visibility states
- **Activity Logging**: Complete operation history with timestamps and severity levels

#### Enterprise Security Architecture
- **Wildcard Network Access**: Manifest allows `["*"]` domains with application-level security controls
- **Session-Based Approval**: Domains approved temporarily, reset on plugin restart for enhanced security
- **Multi-Layer Validation**: HTTPS enforcement, private IP blocking, suspicious domain filtering
- **Rate Limiting**: 10 requests per hour per domain with automatic monitoring and logging
- **Security Auditing**: Complete request history tracking for compliance and monitoring
- **User Consent Flow**: Clear approval modals with security warnings and domain information

#### Modern Animation System
- **Framer Motion Integration**: Professional animations throughout the interface
- **Smooth Transitions**: Modal open/close, toast notifications, component state changes
- **Micro-Interactions**: Hover effects, button feedback, loading states
- **Performance Optimized**: Efficient animation rendering with proper cleanup

### Communication Flow
```
Figma Canvas Selection → Main Thread (code.ts) → UI Thread (index.html) → User Interaction → Main Thread → Figma API
                                    ↓
                            Error Handling System
                                    ↓
                         Toast Notifications + Activity Log
```

## Core Components

### 1. Modern TypeScript Architecture (`ui/components/`)

**Enhanced Component Overview:**
```tsx
// App.tsx - Main component with advanced state management
const App = () => {
  // Core data state
  const [jsonData, setJsonData] = useState(null);
  const [mappings, setMappings] = useState([]);
  
  // Modal management
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Error handling system
  const [logs, setLogs] = useState([]);
  const [toastErrors, setToastErrors] = useState<ToastError[]>([]);
  
  // Advanced error handling
  const addToastError = useCallback((title, message, severity, technicalDetails) => {
    // Creates both toast notification and activity log entry
    const toastError = { id, severity, title, message, timestamp };
    setToastErrors(prev => [...prev, toastError]);
    addLog(technicalDetails || message, severity === 'error' ? 'error' : 'warn');
  }, [addLog]);

  return (
    <div className="relative p-4 font-sans bg-figma-bg">
      <ErrorToast
        errors={toastErrors}
        onDismiss={dismissToastError}
        onOpenActivityLog={() => setIsActivityModalOpen(true)}
      />
      
      <Header
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        hasConfigurableData={!!jsonData && mappings.some(m => m.layerName.trim())}
      />
      
      {/* Main UI Components */}
      <DataSourceTabs />
      <JsonPreview />
      <KeyMapping />
      <ActionSection />
      <LogsSection onOpenModal={() => setIsActivityModalOpen(true)} />
      
      {/* Modal System */}
      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        logs={logs}
      />
      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        savedConfigs={savedConfigs}
        loadConfiguration={loadConfiguration}
      />
      <SaveConfigurationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        saveConfiguration={saveConfiguration}
        dataSource={dataSource}
        mappings={mappings}
      />
    </div>
  );
};
```

### 2. Error Toast System (`ErrorToast.tsx`)

**Advanced Error Management:**
```tsx
interface ToastError {
  id: string;
  severity: 'error' | 'warning' | 'validation';
  title: string;
  message: string;
  timestamp: string;
}

const ErrorToast = ({ errors, onDismiss, onOpenActivityLog }) => {
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'error':
        return { background: 'bg-red-50 border-red-200', text: 'text-red-800' };
      case 'warning':
        return { background: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' };
      case 'validation':
        return { background: 'bg-orange-50 border-orange-200', text: 'text-orange-800' };
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 space-y-2">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`rounded-lg border p-4 shadow-lg ${getSeverityStyles(error.severity).background}`}
          >
            {/* Error content with technical details link */}
            <button onClick={onOpenActivityLog}>
              View technical details →
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### 3. Configuration Management System

**Persistent Configuration with Modal Interface:**
```tsx
// ConfigurationModal.tsx - Full configuration management
const ConfigurationModal = ({ isOpen, savedConfigs, loadConfiguration }) => {
  const [selectedConfig, setSelectedConfig] = useState(null);
  
  const handleApplyConfiguration = () => {
    if (selectedConfig) {
      loadConfiguration(selectedConfig);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50">
          {/* Configuration list with selection */}
          {savedConfigs.map((config) => (
            <div
              key={config.name}
              onClick={() => setSelectedConfig(config)}
              className={selectedConfig?.name === config.name ? 'border-blue-500 bg-blue-50' : ''}
            >
              <h4>{config.name}</h4>
              <p>{config.savedAt} • {config.mappings?.length || 0} mappings</p>
            </div>
          ))}
          
          <button onClick={handleApplyConfiguration} disabled={!selectedConfig}>
            Apply Configuration
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// SaveConfigurationModal.tsx - Specialized save modal
const SaveConfigurationModal = ({ dataSource, mappings, jsonData }) => {
  const activeMappings = mappings.filter(m => m.layerName.trim() !== '');
  
  return (
    <div>
      {/* Configuration preview */}
      <div className="configuration-preview">
        <div>Data Source: {dataSource}</div>
        <div>Data Items: {jsonData?.length || 0}</div>
        <div>Active Mappings: {activeMappings.length}</div>
        <div>Mapped Fields: {activeMappings.slice(0, 3).map(m => m.jsonKey).join(', ')}</div>
      </div>
      
      {/* Save form with validation */}
      <input
        type="text"
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
        placeholder="Enter configuration name"
      />
      
      <button onClick={handleSave} disabled={!configName.trim()}>
        Save Configuration
      </button>
    </div>
  );
};
```

### 4. Activity Log Modal System (`ActivityLogModal.tsx`)

**Comprehensive Activity Management:**
```tsx
const ActivityLogModal = ({ isOpen, logs }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh]">
            <div className="p-6 border-b">
              <h2>Activity Log</h2>
              <p>{logs.length} entries</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
                >
                  <p>{log.message}</p>
                  <p className="text-xs opacity-75">{log.timestamp}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

## Enhanced Error Handling Pipeline

### Error Classification & Routing System
```typescript
// App.tsx - Centralized error handling
const addToastError = useCallback((title: string, message: string, severity: ToastError['severity'], technicalDetails?: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create toast notification
  const toastError: ToastError = { id, severity, title, message, timestamp };
  setToastErrors(prev => [...prev, toastError]);
  
  // Also add to activity log with technical details
  const logMessage = technicalDetails ? `${title}: ${message} (${technicalDetails})` : `${title}: ${message}`;
  const logLevel = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
  addLog(logMessage, logLevel);
}, [addLog]);

// Usage throughout the application
const handleFileUpload = useCallback((file: File) => {
  if (file.size > 2 * 1024 * 1024) {
    addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    return;
  }
  // ... continue processing
}, [addToastError]);

const fetchApiData = useCallback(async () => {
  try {
    // ... fetch logic
  } catch (error) {
    const errorMessage = (error as Error).message;
    addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
  }
}, [addToastError]);
```

### Error Scenarios Coverage
```typescript
// Critical error scenarios handled:
const errorScenarios = {
  // File upload errors
  'file-too-large': () => addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation'),
  'invalid-json': (error) => addToastError('Invalid JSON File', 'The selected file contains invalid JSON data', 'error', error.message),
  'invalid-format': () => addToastError('Invalid Data Format', 'The uploaded data is not in a valid format', 'error'),
  
  // API and network errors
  'api-fetch-failed': (error) => addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', error.message),
  'network-error': (error) => addToastError('Network Error', 'Unable to connect to the server', 'error', error.message),
  
  // Validation errors
  'no-data': () => addToastError('No Data Loaded', 'Please load JSON data before applying to layers', 'validation'),
  'no-mappings': () => addToastError('No Mappings Configured', 'Please configure at least one field mapping', 'validation'),
  'no-selection': () => addToastError('No Layers Selected', 'Please select one or more layers in Figma', 'validation'),
  'config-name-required': () => addToastError('Configuration Name Required', 'Please enter a name for your configuration', 'validation'),
  
  // Plugin and storage errors
  'storage-error': (message) => addToastError('Storage Error', 'Unable to access plugin storage', 'error', message),
  'apply-data-error': (message) => addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message),
  'plugin-error': (message) => addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message)
};
```

## Modern Build System

### esbuild-Powered Compilation
```javascript
// scripts/build-ui-modern.js - Fast, modern build system
const esbuild = require('esbuild');

const buildOptions = {
  entryPoints: ['ui/src/index.tsx'],
  bundle: true,
  outfile: 'ui/dist/bundle.js',
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom'],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  minify: true,
  sourcemap: false,
  metafile: true
};

// Build process:
// 1. Clean dist directory
// 2. Bundle JavaScript with esbuild (includes Framer Motion)
// 3. Process CSS with Tailwind
// 4. Create optimized HTML with inlined assets
// 5. Generate bundle analysis report
```

### Dependencies & Performance
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "esbuild": "^0.19.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "typescript": "^5.0.0"
  }
}

// Bundle Analysis (optimized):
// Total Size: ~290kb (includes React, Framer Motion, all components)
// React DOM: ~127kb (44.5%)
// Framer Motion: ~50kb (17.5%)
// Plugin Components: ~25kb (8.5%)
// Other Dependencies: ~88kb (29.5%)
```

## Data Application Pipeline

### Enhanced Processing with Error Handling
```typescript
// main/code.ts - Main thread processing with comprehensive error handling
async function applyDataToLayers(data: any[], mappings: any[], valueBuilders: any) {
  try {
    const selectedLayers = figma.currentPage.selection;
    if (selectedLayers.length === 0) {
      sendLog('No layers selected', 'error');
      return;
    }

    for (let i = 0; i < selectedLayers.length && i < data.length; i++) {
      const layer = selectedLayers[i];
      const dataItem = data[i];
      
      try {
        await processLayerMappings(layer, dataItem, mappings, valueBuilders);
        sendLog(`✅ Applied data to layer: ${layer.name}`, 'info');
      } catch (layerError) {
        sendLog(`❌ Failed to apply data to layer ${layer.name}: ${layerError.message}`, 'error');
        // Continue processing other layers instead of stopping
      }
    }
    
    sendLog(`🎉 Data application completed: ${Math.min(selectedLayers.length, data.length)} layers processed`, 'info');
  } catch (error) {
    sendLog(`💥 Critical error during data application: ${error.message}`, 'error');
    figma.ui.postMessage({
      type: 'apply-data-error',
      message: error.message
    });
  }
}

function sendLog(message: string, level: string) {
  figma.ui.postMessage({
    type: 'log',
    message,
    level,
    timestamp: new Date().toLocaleTimeString()
  });
}
```

## Development Workflow

### Modern Development Setup
```bash
# 🚀 Modern development commands
npm run build       # Full build: compiles main + UI with modern esbuild system
npm run build:ui    # UI only: modern esbuild compilation with all dependencies
npm run build:main  # Main only: compiles main/code.ts → main/code.js
npm run dev         # Watch mode for development (main thread only)
npm run typecheck   # Type checking without compilation

# 🏗️ Build process details:
# 1. TypeScript compilation for type safety
# 2. esbuild bundling with React, Framer Motion, and all components
# 3. Tailwind CSS processing with custom design tokens
# 4. HTML generation with inlined assets for Figma plugin requirements
# 5. Bundle analysis and optimization reporting
```

### Component Development Guidelines
```tsx
// Modern component development patterns:

// 1. Use proper TypeScript interfaces
interface ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  data: DataType[];
}

// 2. Implement proper error handling
const MyComponent: React.FC<ComponentProps> = ({ isOpen, onClose, data }) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleOperation = useCallback(async () => {
    try {
      // Operation logic
    } catch (err) {
      setError(err.message);
      // Could also trigger toast error here
    }
  }, []);

  // 3. Use Framer Motion for animations
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-container"
        >
          {/* Component content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 4. Proper cleanup and optimization
export default React.memo(MyComponent);
```

## Recent Major Enhancements

### ✅ Professional UX with Modal System (Latest)
- **Modal-Based Interface**: Activity Log, Configuration Management, Save Configuration modals
- **Professional Navigation**: Dedicated modals for different workflows instead of inline sections
- **Enhanced Accessibility**: Proper focus management, keyboard navigation, screen reader support
- **Smooth Animations**: Framer Motion integration for professional feel

### ✅ Advanced Error Handling System (Latest)
- **Toast Notification System**: Immediate, non-blocking error feedback with severity levels
- **Dual Error Approach**: User-friendly toast messages + detailed activity log
- **Error Classification**: Error (red), Warning (yellow), Validation (orange) with appropriate icons
- **Quick Technical Access**: Direct link from toast notifications to full technical details

### ✅ Configuration Management System (Latest)
- **Persistent Storage**: Save/load configurations using Figma's clientStorage API
- **Preview System**: Configuration preview showing data source, mappings, and field count
- **Smart UI Integration**: Save button appears only when there's data worth saving
- **Professional Interface**: Dedicated modals for save vs. load workflows

### ✅ Modern Build System (Latest)
- **esbuild Integration**: Fast, modern bundling replacing slower build systems
- **Optimized Dependencies**: Efficient bundling of React, Framer Motion, and all components
- **Bundle Analysis**: Detailed size analysis and optimization reporting
- **Performance Focused**: ~290kb total bundle with all features and animations

### ✅ Enhanced State Management (Latest)
- **Centralized Error State**: Single source of truth for all error handling
- **Modal State Management**: Coordinated modal visibility and data flow
- **Optimized Re-rendering**: Proper React patterns for performance
- **Activity Logging**: Complete operation history with timestamps and categorization

## Future Enhancement Opportunities

### High Priority
- [ ] **Real-time Configuration Sync**: Live preview of configuration changes
- [ ] **Advanced Error Recovery**: Automatic retry mechanisms for failed operations
- [ ] **Bulk Configuration Management**: Import/export configuration sets
- [ ] **Enhanced Activity Filtering**: Filter activity log by severity, time, or operation type

### Medium Priority  
- [ ] **Custom Error Handlers**: User-defined error handling workflows
- [ ] **Configuration Templates**: Pre-built configuration templates for common use cases
- [ ] **Advanced Animation Controls**: User preferences for animation intensity
- [ ] **Enhanced Accessibility**: Full WCAG 2.1 AA compliance

### Low Priority
- [ ] **Configuration Sharing**: Share configurations between team members
- [ ] **Advanced Modal Stacking**: Support for modal-over-modal workflows
- [ ] **Custom Toast Themes**: User-customizable error notification themes
- [ ] **Performance Profiling**: Built-in performance monitoring and optimization suggestions

## Testing & Quality Assurance

### Error Handling Testing
```typescript
// Test scenarios for error handling system:
const testScenarios = {
  // Toast notification tests
  'toast-display': () => triggerError('validation', 'Test validation error'),
  'toast-stacking': () => {
    triggerError('error', 'First error');
    triggerError('warning', 'Second warning');
    triggerError('validation', 'Third validation');
  },
  'toast-dismissal': () => testToastDismissal(),
  'toast-activity-link': () => testActivityLogLink(),
  
  // Modal system tests
  'modal-state-management': () => testModalStateTransitions(),
  'modal-data-persistence': () => testConfigurationPersistence(),
  'modal-animation-performance': () => testAnimationSmoothnessToastDismissal
  
  // Configuration system tests
  'config-save-load': () => testConfigurationWorkflow(),
  'config-preview-accuracy': () => testConfigurationPreview(),
  'config-validation': () => testConfigurationValidation()
};
```

### Performance Monitoring
```typescript
// Performance considerations:
const performanceMetrics = {
  'bundle-size': '~290kb (optimized with esbuild)',
  'initial-load': '<100ms (inlined assets)',
  'modal-transition': '<200ms (Framer Motion optimized)',
  'toast-display': '<50ms (minimal DOM manipulation)',
  'configuration-save': '<100ms (Figma clientStorage)',
  'error-handling': '<10ms (optimized error classification)'
};
```

## API References & Integration

### Figma Plugin API Usage
```typescript
// Enhanced Figma API integration:
const figmaApiPatterns = {
  // Selection management with error handling
  'selection-handling': () => {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      sendErrorToUI('no-selection', 'No layers selected');
      return;
    }
    // Process selection...
  },
  
  // Storage with error recovery
  'client-storage': async (key: string, value: any) => {
    try {
      await figma.clientStorage.setAsync(key, value);
      sendLogToUI('Configuration saved successfully', 'info');
    } catch (error) {
      sendErrorToUI('storage-error', `Failed to save: ${error.message}`);
    }
  },
  
  // UI messaging with error context
  'ui-messaging': (type: string, data: any, errorContext?: string) => {
    figma.ui.postMessage({
      type,
      ...data,
      timestamp: new Date().toISOString(),
      errorContext
    });
  }
};
```

### React + TypeScript Integration
```typescript
// Modern React patterns used throughout:
const reactPatterns = {
  // State management with proper typing
  'typed-state': () => {
    const [errors, setErrors] = useState<ToastError[]>([]);
    const [configs, setConfigs] = useState<Configuration[]>([]);
  },
  
  // Optimized callbacks with dependency arrays
  'optimized-callbacks': () => {
    const addToastError = useCallback((title: string, message: string, severity: ToastError['severity']) => {
      // Implementation...
    }, []);
  },
  
  // Proper cleanup with useEffect
  'effect-cleanup': () => {
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        // Handle plugin messages...
      };
      
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);
  },
  
  // Conditional rendering patterns
  'conditional-rendering': () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div>
          {/* Modal content */}
        </motion.div>
      )}
    </AnimatePresence>
  )
};
```

## Security Architecture & Audit History

### 🔒 Security Posture (Updated: August 2025)
**Current Status: PRODUCTION READY** - All critical vulnerabilities resolved

#### **Comprehensive Security Audit Results**
A thorough security audit was conducted in August 2025, identifying and fixing all critical vulnerabilities:

**CRITICAL FIXES IMPLEMENTED:**
- ✅ **Prototype Pollution** - Fixed CSV parsing vulnerability that allowed malicious files to modify JavaScript object prototypes
- ✅ **Weak Cryptography Removal** - Eliminated insecure XOR-based fallback encryption, now requires Web Crypto API
- ✅ **Origin Validation Bypass** - Strengthened PostMessage validation to prevent domain spoofing attacks
- ✅ **CSV Injection Protection** - Added sanitization to prevent formula injection in spreadsheet applications
- ✅ **Information Disclosure** - Sanitized console logging to prevent sensitive data exposure

#### **Current Security Features**
```typescript
// Multi-layered security approach
const securityLayers = {
  // 1. Network Security
  domainApproval: 'Session-based approval system with user consent',
  httpsEnforcement: 'Only HTTPS URLs allowed, private IP blocking',
  rateLimiting: '10 requests per hour per domain with monitoring',
  
  // 2. Data Security  
  inputSanitization: 'Text content cleaning for Figma nodes',
  csvInjectionProtection: 'Formula detection and neutralization',
  prototypePolllutionPrevention: 'Object property validation',
  
  // 3. Communication Security
  postMessageValidation: 'Strict origin allowlist for iframe communication',
  credentialEncryption: 'AES-GCM with Web Crypto API (no weak fallbacks)',
  secureLogging: 'Activity tracking without sensitive data exposure'
};
```

#### **Security Implementation Patterns**
```typescript
// Example: Secure CSV Processing
const sanitizeCSVValue = (value: string): string => {
  if (typeof value !== 'string') return String(value);
  
  // Check for potential formula injection characters
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => value.startsWith(char))) {
    // Prepend with single quote to neutralize formula
    return `'${value}`;
  }
  
  return value;
};

// Example: Secure Domain Validation  
private static extractDomain(url: string): string {
  try {
    const match = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
    if (match && match[1]) {
      // Normalize to lowercase to prevent case-based bypass attempts
      let domain = match[1].toLowerCase();
      
      // Basic validation to prevent obvious bypass attempts
      if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
        return 'invalid';
      }
      
      return domain;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}
```

#### **Credential Storage Decision**
**IMPORTANT:** This plugin does NOT store credentials persistently for security reasons.

- ❌ **figma.clientStorage** - Not suitable for credentials (Figma docs: "for stability, not security")
- ❌ **Weak fallback encryption** - Removed entirely to prevent false sense of security  
- ✅ **Session-based approach** - Temporary domain approvals, no credential persistence
- ✅ **Web Crypto API requirement** - Strong encryption when absolutely necessary

#### **Security Testing & Validation**
```typescript
// Security test scenarios implemented:
const securityTests = {
  prototypePolluton: 'CSV files with __proto__, constructor, prototype headers',
  csvInjection: 'Values starting with =, +, -, @, formula injection attempts',
  originSpoofing: 'PostMessage from evil-figma-attacker.com domains',
  domainBypass: 'Case variations, malformed domains, IP addresses',
  informationDisclosure: 'Console logs exposing URLs, errors, sensitive data'
};
```

### 🛡️ Security Guidelines for Future Development

#### **DO's:**
- ✅ Use Web Crypto API for any encryption needs
- ✅ Validate all user inputs (CSV, JSON, URLs)  
- ✅ Use strict allowlists for domain/origin validation
- ✅ Sanitize data before applying to Figma nodes
- ✅ Use the existing session-based security model
- ✅ Add security tests for new features

#### **DON'Ts:**
- ❌ Never store credentials in figma.clientStorage
- ❌ Don't implement custom/weak encryption
- ❌ Avoid permissive regex patterns for validation
- ❌ Don't log sensitive data (URLs, tokens, user input)
- ❌ Never trust user input without validation
- ❌ Don't bypass existing security controls

#### **Security Review Checklist**
When adding new features, verify:
- [ ] Input validation for all user data
- [ ] No new credential storage mechanisms
- [ ] Console logging doesn't expose sensitive data
- [ ] Network requests go through existing domain approval
- [ ] PostMessage validation uses strict origins
- [ ] No new prototype pollution vectors
- [ ] Follows existing security patterns

---

*This developer reference provides comprehensive technical context for the plugin's modern architecture, advanced error handling system, professional UX implementation, and enterprise-grade security posture. It should enable any developer to quickly understand, safely extend, and maintain the plugin's capabilities.*