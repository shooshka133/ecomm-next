#!/bin/bash
# Version Control - Ecommerce Start Default
# Run this script to commit and push all changes

echo "📦 Preparing commit for Ecommerce Start default version..."

# Add all changes
echo "📝 Adding all changes..."
git add .

# Create comprehensive commit
echo "💾 Creating commit..."
git commit -m "feat: Multi-brand system with Ecommerce Start as default

Core Features:
- Complete admin brand management UI
- Service router for multi-tenant support (Supabase, Resend, Stripe)
- Dynamic branding across all components
- Brand switching without code changes

Brands Supported:
- Ecommerce Start (default/fallback in brand.config.ts)
- Green Theme Store (database-stored)
- Grocery Store (ready for setup)

Service Router:
- Routes to correct Supabase project per brand
- Routes to correct Resend account per brand
- Routes to correct Stripe account per brand
- Complete data isolation between brands

Documentation:
- Complete multi-brand setup guides
- Grocery store setup guide
- Vercel deployment guide
- Docker self-hosting guide
- Custom domains configuration
- Troubleshooting guides

Files Changed:
- brand.config.ts: Restored to Ecommerce Start (default)
- Service router implementation
- All components updated for dynamic branding
- Admin brand management UI
- Comprehensive documentation

Ready for:
- Production deployment (Vercel)
- Self-hosting (Docker)
- Multiple brands with complete isolation"

# Push to remote
echo "🚀 Pushing to remote..."
git push origin admin/brand-ui

echo "✅ Done! Changes pushed to admin/brand-ui branch"

