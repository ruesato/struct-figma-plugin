import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as esbuild from 'esbuild';

const execAsync = promisify(exec);

/**
 * Modern build script using esbuild for fast, optimized compilation
 */

async function buildUI() {
  console.log('🚀 Building UI with modern esbuild...');

  const uiDir = path.join(__dirname, '..', 'ui');
  const srcDir = path.join(uiDir, 'src');
  const distDir = path.join(uiDir, 'dist');
  
  try {
    // Step 1: Clean and create dist directory
    console.log('🧹 Cleaning dist directory...');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    // Step 2: Bundle JavaScript with esbuild (much faster than Babel + webpack)
    console.log('⚛️  Building JavaScript bundle with esbuild...');
    
    const result = await esbuild.build({
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
    });

    console.log('✅ JavaScript bundle created');
    console.log(`📦 Bundle size: ${(fs.statSync(path.join(distDir, 'bundle.js')).size / 1024).toFixed(1)} KB`);

    // Step 3: Process CSS with PostCSS and Tailwind
    console.log('🎨 Processing CSS with Tailwind...');
    const inputCssPath = path.join(uiDir, 'styles.css');
    const outputCssPath = path.join(distDir, 'styles.css');
    
    await execAsync(`npx postcss ${inputCssPath} -o ${outputCssPath}`);
    
    const cssContent = fs.readFileSync(outputCssPath, 'utf-8');
    console.log(`✅ CSS processed: ${(cssContent.length / 1024).toFixed(1)} KB`);
    
    // Step 4: Create optimized HTML from template with security headers
    console.log('📄 Creating optimized HTML from template...');
    
    const jsContent = fs.readFileSync(path.join(distDir, 'bundle.js'), 'utf-8');
    
    // Read the template file with security headers
    const templatePath = path.join(uiDir, 'index.template.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Inject CSS and JS into template
    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
    htmlContent = htmlContent.replace('/* INJECT_JS */', jsContent);

    const finalHtmlPath = path.join(uiDir, 'index.html');
    fs.writeFileSync(finalHtmlPath, htmlContent);
    
    // Step 5: Calculate final sizes
    const finalHtmlSize = fs.statSync(finalHtmlPath).size;
    
    console.log('🎉 Build completed successfully!');
    console.log(`📊 Final HTML: ${(finalHtmlSize / 1024).toFixed(1)} KB`);
    console.log(`⚡ Improvement: No runtime JSX compilation, bundled dependencies`);
    console.log('');
    
    // Optional: Log build analysis
    if (result.metafile) {
      const analysis = await esbuild.analyzeMetafile(result.metafile);
      console.log('📈 Bundle analysis:');
      console.log(analysis);
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
if (require.main === module) {
  buildUI();
}

export default buildUI;