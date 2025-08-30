const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

/**
 * Unified build script using esbuild for both main plugin and UI
 */
async function buildUnified() {
  console.log('🚀 Building plugin with unified esbuild...');

  try {
    // Step 1: Clean dist directories
    console.log('🧹 Cleaning output directories...');
    const mainDist = path.join(__dirname, '..', 'dist');
    const uiDist = path.join(__dirname, '..', 'ui', 'dist');
    
    if (fs.existsSync(mainDist)) {
      fs.rmSync(mainDist, { recursive: true });
    }
    if (fs.existsSync(uiDist)) {
      fs.rmSync(uiDist, { recursive: true });
    }
    
    fs.mkdirSync(mainDist, { recursive: true });
    fs.mkdirSync(uiDist, { recursive: true });

    // Step 2: Build main plugin code with esbuild
    console.log('🔌 Building main plugin code...');
    await esbuild.build({
      entryPoints: [path.join(__dirname, '..', 'main', 'code.ts')],
      bundle: false, // Don't bundle - Figma needs separate file
      minify: true,
      format: 'cjs', // CommonJS for Figma plugin
      target: ['es6'],
      outfile: path.join(mainDist, 'code.js'),
      loader: {
        '.ts': 'ts'
      },
      platform: 'neutral', // Figma sandbox environment
      external: [], // No external deps for main plugin
      write: true
    });

    const mainSize = fs.statSync(path.join(mainDist, 'code.js')).size;
    console.log(`✅ Main plugin built: ${(mainSize / 1024).toFixed(1)} KB`);

    // Step 3: Build UI with esbuild
    console.log('⚛️  Building UI bundle...');
    const uiResult = await esbuild.build({
      entryPoints: [path.join(__dirname, '..', 'ui', 'src', 'index.tsx')],
      bundle: true,
      minify: true,
      format: 'iife',
      target: ['es6'],
      outfile: path.join(uiDist, 'bundle.js'),
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      jsx: 'automatic',
      jsxImportSource: 'react',
      metafile: true,
      write: true
    });

    const uiSize = fs.statSync(path.join(uiDist, 'bundle.js')).size;
    console.log(`✅ UI bundle built: ${(uiSize / 1024).toFixed(1)} KB`);

    // Step 4: Process CSS with PostCSS
    console.log('🎨 Processing CSS...');
    const inputCssPath = path.join(__dirname, '..', 'ui', 'styles.css');
    const outputCssPath = path.join(uiDist, 'styles.css');
    
    execSync(`npx postcss ${inputCssPath} -o ${outputCssPath}`, { stdio: 'inherit' });
    
    const cssSize = fs.statSync(outputCssPath).size;
    console.log(`✅ CSS processed: ${(cssSize / 1024).toFixed(1)} KB`);

    // Step 5: Create final HTML
    console.log('📄 Creating final HTML...');
    const jsContent = fs.readFileSync(path.join(uiDist, 'bundle.js'), 'utf-8');
    const cssContent = fs.readFileSync(outputCssPath, 'utf-8');
    const templatePath = path.join(__dirname, '..', 'ui', 'index.template.html');
    
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
    htmlContent = htmlContent.replace('/* INJECT_JS */', jsContent);
    
    const finalHtmlPath = path.join(__dirname, '..', 'ui', 'index.html');
    fs.writeFileSync(finalHtmlPath, htmlContent);
    
    const htmlSize = fs.statSync(finalHtmlPath).size;
    console.log(`✅ Final HTML: ${(htmlSize / 1024).toFixed(1)} KB`);

    // Step 6: Copy and fix manifest
    console.log('📋 Copying and fixing manifest...');
    const manifestSrc = path.join(__dirname, '..', 'manifest.json');
    const manifestDest = path.join(mainDist, 'manifest.json');
    if (fs.existsSync(manifestSrc)) {
      let manifestContent = fs.readFileSync(manifestSrc, 'utf-8');
      // Fix main path to be relative to dist directory
      manifestContent = manifestContent.replace('"main": "dist/code.js"', '"main": "code.js"');
      fs.writeFileSync(manifestDest, manifestContent);
    }

    console.log('');
    console.log('🎉 Unified build completed successfully!');
    console.log(`📦 Main plugin: dist/code.js (${(mainSize / 1024).toFixed(1)} KB)`);
    console.log(`📦 UI bundle: ui/dist/bundle.js (${(uiSize / 1024).toFixed(1)} KB)`);
    console.log(`📦 Final HTML: ui/index.html (${(htmlSize / 1024).toFixed(1)} KB)`);
    console.log('⚡ Single build system, consistent tooling!');

    // Optional: Bundle analysis
    if (uiResult.metafile) {
      const analysis = await esbuild.analyzeMetafile(uiResult.metafile);
      console.log('\n📈 UI Bundle analysis:');
      console.log(analysis);
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
if (require.main === module) {
  buildUnified();
}

module.exports = buildUnified;