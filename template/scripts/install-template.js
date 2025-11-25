#!/usr/bin/env node

/**
 * Template Installation Script
 * 
 * This script helps new users set up the e-commerce template quickly.
 * It guides them through:
 * 1. Copying environment variables
 * 2. Setting up Supabase
 * 3. Setting up Stripe
 * 4. Setting up Resend
 * 5. Applying branding
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 E-Commerce Template Installation\n');
  console.log('This script will help you set up your store.\n');

  // Step 1: Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const overwrite = await question('.env.local already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipping environment setup.');
      rl.close();
      return;
    }
  }

  // Step 2: Collect Supabase credentials
  console.log('\n📦 Step 1: Supabase Setup');
  console.log('Get these from: https://supabase.com/dashboard/project/_/settings/api\n');
  
  const supabaseUrl = await question('Supabase URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');

  // Step 3: Collect Stripe credentials
  console.log('\n💳 Step 2: Stripe Setup');
  console.log('Get these from: https://dashboard.stripe.com/apikeys\n');
  
  const stripePublishableKey = await question('Stripe Publishable Key (pk_...): ');
  const stripeSecretKey = await question('Stripe Secret Key (sk_...): ');
  const stripeWebhookSecret = await question('Stripe Webhook Secret (whsec_...): ');

  // Step 4: Collect Resend credentials
  console.log('\n📧 Step 3: Resend Setup');
  console.log('Get this from: https://resend.com/api-keys\n');
  
  const resendApiKey = await question('Resend API Key (re_...): ');
  const resendFromEmail = await question('Resend From Email (e.g., noreply@yourdomain.com): ');

  // Step 5: Collect App URL
  console.log('\n🌐 Step 4: App Configuration');
  const appUrl = await question('App URL (e.g., https://yourstore.com or http://localhost:3000): ');

  // Step 6: Collect Admin Email
  console.log('\n👤 Step 5: Admin Setup');
  const adminEmails = await question('Admin Email(s) (comma-separated): ');

  // Step 7: Template Mode
  const templateMode = await question('Enable Template Mode? (y/n): ');

  // Generate .env.local
  const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}

# Resend
RESEND_API_KEY=${resendApiKey}
RESEND_FROM_EMAIL=${resendFromEmail}

# App
NEXT_PUBLIC_APP_URL=${appUrl}
NEXT_PUBLIC_TEMPLATE_MODE=${templateMode.toLowerCase() === 'y' ? 'true' : 'false'}

# Admin
ADMIN_EMAILS=${adminEmails}
`;

  fs.writeFileSync(envLocalPath, envContent);
  console.log('\n✅ .env.local created successfully!');

  // Step 8: Database setup instructions
  console.log('\n📊 Step 6: Database Setup');
  console.log('\nNext steps:');
  console.log('1. Go to your Supabase project: https://supabase.com/dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run these SQL files in order:');
  console.log('   - supabase-schema.sql');
  console.log('   - supabase-user-profiles.sql');
  console.log('   - supabase-order-tracking.sql');
  console.log('   - supabase-admin-role.sql');
  console.log('   - supabase-wishlist.sql');
  console.log('\n4. Set your admin user:');
  console.log('   UPDATE user_profiles');
  console.log('   SET is_admin = true');
  console.log(`   WHERE id = (SELECT id FROM auth.users WHERE email = '${adminEmails.split(',')[0]}');`);

  // Step 9: Stripe webhook setup
  console.log('\n🔗 Step 7: Stripe Webhook Setup');
  console.log('1. Go to: https://dashboard.stripe.com/webhooks');
  console.log('2. Add endpoint: ' + appUrl + '/api/webhook');
  console.log('3. Select event: checkout.session.completed');
  console.log('4. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET');

  console.log('\n🎉 Setup complete! Run "npm run dev" to start your store.\n');
  rl.close();
}

main().catch(console.error);

