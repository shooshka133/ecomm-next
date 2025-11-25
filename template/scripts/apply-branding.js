#!/usr/bin/env node

/**
 * Branding Application Script
 * 
 * This script applies custom branding from template/override/ to the project.
 * It merges branding.json and copies logo files.
 */

const fs = require('fs');
const path = require('path');

const templateDir = path.join(process.cwd(), 'template');
const overrideDir = path.join(templateDir, 'override');
const configDir = path.join(templateDir, 'config');
const appDir = process.cwd();

function mergeObjects(defaultObj, overrideObj) {
  const merged = { ...defaultObj };
  for (const key in overrideObj) {
    if (typeof overrideObj[key] === 'object' && !Array.isArray(overrideObj[key])) {
      merged[key] = mergeObjects(merged[key] || {}, overrideObj[key]);
    } else {
      merged[key] = overrideObj[key];
    }
  }
  return merged;
}

function applyBranding() {
  console.log('🎨 Applying branding...\n');

  // Load default branding
  const defaultBrandingPath = path.join(configDir, 'branding.json');
  const defaultBranding = JSON.parse(fs.readFileSync(defaultBrandingPath, 'utf8'));

  // Load override branding if exists
  const overrideBrandingPath = path.join(overrideDir, 'branding.json');
  let branding = defaultBranding;
  
  if (fs.existsSync(overrideBrandingPath)) {
    const overrideBranding = JSON.parse(fs.readFileSync(overrideBrandingPath, 'utf8'));
    branding = mergeObjects(defaultBranding, overrideBranding);
    console.log('✅ Merged custom branding.json');
  }

  // Write merged branding to lib/template/branding.json (runtime config)
  const runtimeBrandingPath = path.join(appDir, 'lib', 'template', 'branding.json');
  const runtimeBrandingDir = path.dirname(runtimeBrandingPath);
  
  if (!fs.existsSync(runtimeBrandingDir)) {
    fs.mkdirSync(runtimeBrandingDir, { recursive: true });
  }
  
  fs.writeFileSync(runtimeBrandingPath, JSON.stringify(branding, null, 2));
  console.log('✅ Created lib/template/branding.json');

  // Copy logo files if they exist in override
  const logoFiles = [
    { src: 'logo.svg', dest: 'app/icon.svg' },
    { src: 'logo.svg', dest: 'app/apple-icon.svg' },
    { src: 'favicon.svg', dest: 'app/icon.svg' },
    { src: 'apple-icon.svg', dest: 'app/apple-icon.svg' },
  ];

  let copiedFiles = 0;
  for (const file of logoFiles) {
    const srcPath = path.join(overrideDir, file.src);
    const destPath = path.join(appDir, file.dest);
    
    if (fs.existsSync(srcPath)) {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file.src} → ${file.dest}`);
      copiedFiles++;
    }
  }

  if (copiedFiles === 0) {
    console.log('ℹ️  No logo files found in template/override/');
    console.log('   Using default logos from app/');
  }

  console.log('\n✨ Branding applied successfully!');
  console.log('   Restart your dev server to see changes.\n');
}

applyBranding();

