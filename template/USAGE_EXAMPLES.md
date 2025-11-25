# Template Usage Examples

## Example 1: Quick Setup for New Store

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ecomm-next.git
cd ecomm-next

# 2. Install dependencies
npm install

# 3. Run interactive setup
npm run template:install

# 4. Follow the prompts to enter:
#    - Supabase credentials
#    - Stripe keys
#    - Resend API key
#    - Admin email

# 5. Set up database (run SQL files in Supabase)

# 6. Apply custom branding (optional)
npm run template:branding

# 7. Start development server
npm run dev
```

## Example 2: Customizing Branding

### Step 1: Create Override File

Create `template/override/branding.json`:
```json
{
  "storeName": "TechGadgets Pro",
  "storeSlogan": "Cutting-edge technology for modern life",
  "primaryColor": "#00D9FF",
  "secondaryColor": "#FF6B35",
  "supportEmail": "support@techgadgets.pro"
}
```

### Step 2: Add Custom Logo

1. Place `logo.svg` in `template/override/`
2. Run: `npm run template:branding`
3. Logo is copied to `app/icon.svg`

### Step 3: Enable Template Mode

In `.env.local`:
```env
NEXT_PUBLIC_TEMPLATE_MODE=true
```

Restart dev server to see changes.

## Example 3: Updating from Main Repository

```bash
# 1. Save your customizations
git add template/override/
git commit -m "Save custom branding"

# 2. Pull updates
git pull origin main

# 3. Re-apply branding (if needed)
npm run template:branding

# 4. Test everything works
npm run dev
```

## Example 4: Using Template Functions in Code

### In a Component (when template mode is enabled)

```typescript
import { getStoreBranding } from '@/lib/template/branding'

export default function MyComponent() {
  const branding = getStoreBranding()
  
  return (
    <div>
      <h1>{branding.storeName}</h1>
      <p>{branding.storeSlogan}</p>
    </div>
  )
}
```

### In Server Component

```typescript
import { getStoreName, getSupportEmail } from '@/lib/template/branding'

export default function ServerComponent() {
  const storeName = getStoreName()
  const supportEmail = getSupportEmail()
  
  return <footer>© {storeName} - {supportEmail}</footer>
}
```

## Example 5: Environment Variable Management

### Sync from JSON to .env.local

1. Edit `template/config/env.example.json`
2. Run: `npm run template:sync-env`
3. Existing values in `.env.local` are preserved
4. New values from JSON are added

### Manual .env.local Setup

```env
# Copy from template/config/env.example.json and fill in:

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=https://yourstore.com
NEXT_PUBLIC_TEMPLATE_MODE=true

ADMIN_EMAILS=admin@yourstore.com
```

## Example 6: Multi-Store Deployment

If deploying multiple stores from this template:

### Store 1: Electronics Store
```bash
# Customize branding
echo '{"storeName": "ElectroMart"}' > template/override/branding.json
npm run template:branding

# Deploy to Vercel with different env vars
```

### Store 2: Fashion Store
```bash
# Customize branding
echo '{"storeName": "FashionHub"}' > template/override/branding.json
npm run template:branding

# Deploy to Vercel with different env vars
```

Each store maintains its own `template/override/` directory.

## Example 7: Adding Template Mode Banner to Admin

### Option 1: Add to Admin Page (when ready)

In `app/admin/page.tsx`, add:
```typescript
import TemplateModeBanner from '@/components/TemplateModeBanner'

// In component JSX:
{isAdmin && <TemplateModeBanner />}
```

**Note**: This is optional. The banner only shows when `NEXT_PUBLIC_TEMPLATE_MODE=true`.

## Example 8: Testing Template Mode

### Enable Template Mode
```env
NEXT_PUBLIC_TEMPLATE_MODE=true
```

### Disable Template Mode
```env
NEXT_PUBLIC_TEMPLATE_MODE=false
```

### Verify It Works
1. Enable template mode
2. Edit `lib/template/branding.json`
3. Restart dev server
4. Check that store name/colors changed
5. Disable template mode
6. Verify original values returned

---

## Common Patterns

### Pattern 1: Branding Without Template Mode

Even without template mode, you can:
1. Edit `template/config/branding.json`
2. Run `npm run template:branding`
3. Manually use `getStoreBranding()` in your code

### Pattern 2: Environment-Specific Branding

```bash
# Development
NEXT_PUBLIC_TEMPLATE_MODE=false

# Staging
NEXT_PUBLIC_TEMPLATE_MODE=true
# Use staging branding.json

# Production
NEXT_PUBLIC_TEMPLATE_MODE=true
# Use production branding.json
```

### Pattern 3: Gradual Migration

1. Start with template mode OFF
2. Create `template/override/branding.json`
3. Test with template mode ON
4. Once verified, keep template mode ON

---

For more details, see `template/README.md`.

