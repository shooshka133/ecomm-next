#!/usr/bin/env node

/**
 * Environment Variable Sync Script
 * 
 * This script syncs environment variables from template/config/env.example.json
 * to .env.local, merging with existing values.
 */

const fs = require('fs');
const path = require('path');

const configDir = path.join(process.cwd(), 'template', 'config');
const envExamplePath = path.join(configDir, 'env.example.json');
const envLocalPath = path.join(process.cwd(), '.env.local');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

function envToJson(env) {
  // Convert .env format to JSON structure
  return {
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    stripe: {
      publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: env.STRIPE_SECRET_KEY || '',
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    },
    resend: {
      apiKey: env.RESEND_API_KEY || '',
      fromEmail: env.RESEND_FROM_EMAIL || '',
      fromName: env.RESEND_FROM_NAME || 'Ecommerce Start',
    },
    app: {
      url: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      templateMode: env.NEXT_PUBLIC_TEMPLATE_MODE === 'true',
    },
    admin: {
      emails: env.ADMIN_EMAILS || '',
    },
    store: {
      currency: env.STORE_CURRENCY || 'USD',
      currencySymbol: env.STORE_CURRENCY_SYMBOL || '$',
      shippingCountries: (env.STORE_SHIPPING_COUNTRIES || 'US,CA,GB,AU').split(','),
    },
  };
}

function jsonToEnv(json) {
  let content = '# Environment Variables\n';
  content += '# Generated from template/config/env.example.json\n\n';

  content += `# Supabase\n`;
  content += `NEXT_PUBLIC_SUPABASE_URL=${json.supabase.url}\n`;
  content += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${json.supabase.anonKey}\n`;
  content += `SUPABASE_SERVICE_ROLE_KEY=${json.supabase.serviceRoleKey}\n\n`;

  content += `# Stripe\n`;
  content += `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${json.stripe.publishableKey}\n`;
  content += `STRIPE_SECRET_KEY=${json.stripe.secretKey}\n`;
  content += `STRIPE_WEBHOOK_SECRET=${json.stripe.webhookSecret}\n\n`;

  content += `# Resend\n`;
  content += `RESEND_API_KEY=${json.resend.apiKey}\n`;
  content += `RESEND_FROM_EMAIL=${json.resend.fromEmail}\n`;
  if (json.resend.fromName) {
    content += `RESEND_FROM_NAME=${json.resend.fromName}\n`;
  }
  content += `\n`;

  content += `# App\n`;
  content += `NEXT_PUBLIC_APP_URL=${json.app.url}\n`;
  content += `NEXT_PUBLIC_TEMPLATE_MODE=${json.app.templateMode}\n\n`;

  content += `# Admin\n`;
  content += `ADMIN_EMAILS=${json.admin.emails}\n\n`;

  content += `# Store\n`;
  content += `STORE_CURRENCY=${json.store.currency}\n`;
  content += `STORE_CURRENCY_SYMBOL=${json.store.currencySymbol}\n`;
  content += `STORE_SHIPPING_COUNTRIES=${json.store.shippingCountries.join(',')}\n`;

  return content;
}

function syncEnv() {
  console.log('🔄 Syncing environment variables...\n');

  // Load example JSON
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ template/config/env.example.json not found!');
    process.exit(1);
  }

  const exampleJson = JSON.parse(fs.readFileSync(envExamplePath, 'utf8'));

  // Load existing .env.local if it exists
  const existingEnv = parseEnvFile(envLocalPath);
  const existingJson = envToJson(existingEnv);

  // Merge: existing values take precedence
  const merged = {
    supabase: { ...exampleJson.supabase, ...existingJson.supabase },
    stripe: { ...exampleJson.stripe, ...existingJson.stripe },
    resend: { ...exampleJson.resend, ...existingJson.resend },
    app: { ...exampleJson.app, ...existingJson.app },
    admin: { ...exampleJson.admin, ...existingJson.admin },
    store: { ...exampleJson.store, ...existingJson.store },
  };

  // Convert back to .env format
  const envContent = jsonToEnv(merged);

  // Write .env.local
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Synced environment variables to .env.local');
  console.log('   Existing values were preserved.\n');
}

syncEnv();

