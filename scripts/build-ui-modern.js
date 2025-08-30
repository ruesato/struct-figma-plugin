"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var child_process_1 = require("child_process");
var util_1 = require("util");
var esbuild = __importStar(require("esbuild"));
var execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Modern build script using esbuild for fast, optimized compilation
 */
function buildUI() {
    return __awaiter(this, void 0, void 0, function () {
        var uiDir, srcDir, distDir, result, inputCssPath, outputCssPath, cssContent, jsContent, templatePath, htmlContent, finalHtmlPath, finalHtmlSize, analysis, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Building UI with modern esbuild...');
                    uiDir = path.join(__dirname, '..', 'ui');
                    srcDir = path.join(uiDir, 'src');
                    distDir = path.join(uiDir, 'dist');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Step 1: Clean and create dist directory
                    console.log('🧹 Cleaning dist directory...');
                    if (fs.existsSync(distDir)) {
                        fs.rmSync(distDir, { recursive: true });
                    }
                    fs.mkdirSync(distDir, { recursive: true });
                    // Step 2: Bundle JavaScript with esbuild (much faster than Babel + webpack)
                    console.log('⚛️  Building JavaScript bundle with esbuild...');
                    return [4 /*yield*/, esbuild.build({
                            entryPoints: [path.join(srcDir, 'index.tsx')],
                            bundle: true,
                            minify: true,
                            format: 'iife',
                            target: ['es2020'],
                            outfile: path.join(distDir, 'bundle.js'),
                            loader: {
                                '.tsx': 'tsx',
                                '.ts': 'ts'
                            },
                            define: {
                                'process.env.NODE_ENV': '"production"'
                            },
                            external: [], // Bundle everything
                            jsx: 'automatic',
                            jsxImportSource: 'react',
                            metafile: true,
                            write: true
                        })];
                case 2:
                    result = _a.sent();
                    console.log('✅ JavaScript bundle created');
                    console.log("\uD83D\uDCE6 Bundle size: ".concat((fs.statSync(path.join(distDir, 'bundle.js')).size / 1024).toFixed(1), " KB"));
                    // Step 3: Process CSS with PostCSS and Tailwind
                    console.log('🎨 Processing CSS with Tailwind...');
                    inputCssPath = path.join(uiDir, 'styles.css');
                    outputCssPath = path.join(distDir, 'styles.css');
                    return [4 /*yield*/, execAsync("npx postcss ".concat(inputCssPath, " -o ").concat(outputCssPath))];
                case 3:
                    _a.sent();
                    cssContent = fs.readFileSync(outputCssPath, 'utf-8');
                    console.log("\u2705 CSS processed: ".concat((cssContent.length / 1024).toFixed(1), " KB"));
                    // Step 4: Create optimized HTML from template with security headers
                    console.log('📄 Creating optimized HTML from template...');
                    jsContent = fs.readFileSync(path.join(distDir, 'bundle.js'), 'utf-8');
                    templatePath = path.join(uiDir, 'index.template.html');
                    htmlContent = fs.readFileSync(templatePath, 'utf-8');
                    // Inject CSS and JS into template
                    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
                    htmlContent = htmlContent.replace('/* INJECT_JS */', jsContent);
                    finalHtmlPath = path.join(uiDir, 'index.html');
                    fs.writeFileSync(finalHtmlPath, htmlContent);
                    finalHtmlSize = fs.statSync(finalHtmlPath).size;
                    console.log('🎉 Build completed successfully!');
                    console.log("\uD83D\uDCCA Final HTML: ".concat((finalHtmlSize / 1024).toFixed(1), " KB"));
                    console.log("\u26A1 Improvement: No runtime JSX compilation, bundled dependencies");
                    console.log('');
                    if (!result.metafile) return [3 /*break*/, 5];
                    return [4 /*yield*/, esbuild.analyzeMetafile(result.metafile)];
                case 4:
                    analysis = _a.sent();
                    console.log('📈 Bundle analysis:');
                    console.log(analysis);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Build failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Run the build
if (require.main === module) {
    buildUI();
}
exports.default = buildUI;
