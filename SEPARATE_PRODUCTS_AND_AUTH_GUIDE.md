# Guide: Separating Products and Authentication

## 📊 Current Architecture

### Current Setup (Single Supabase Project)
Everything is currently in **ONE Supabase project**:

```
Single Supabase Project
├── Authentication (auth.users)
│   ├── User accounts
│   └── Sessions
│
├── Products Data
│   ├── products (public table)
│   └── No user_id - shared across all users
│
└── User-Specific Data
    ├── cart_items (linked to auth.users via user_id)
    ├── orders (linked to auth.users via user_id)
    ├── user_profiles (linked to auth.users via user_id)
    ├── user_addresses (linked to auth.users via user_id)
    └── wishlist (linked to auth.users via user_id)
```

**Key Point:** Products are **public/shared** - all users see the same products. User data is **private** - each user only sees their own cart, orders, etc.

---

## 🎯 Option 1: Keep Same Database (Recommended for Single Store)

### Structure
- **Same Supabase project**
- **Same database**
- **Different tables** (already separated)

### Pros
✅ Simple setup  
✅ No code changes needed  
✅ Products are already public (no user_id)  
✅ User data is already isolated via RLS (Row Level Security)  
✅ Single connection string  
✅ Easy to manage  

### Cons
❌ All data in one place  
❌ Can't scale products/auth independently  

### When to Use
- Single store/brand
- Small to medium scale
- Don't need separate scaling

---

## 🎯 Option 2: Separate Supabase Projects (For Multi-Brand/Multi-Store)

### Structure
```
Supabase Project 1 (Products)
├── products table
└── Public read access

Supabase Project 2 (Authentication)
├── auth.users
├── cart_items
├── orders
├── user_profiles
└── user_addresses
```

### Setup Steps

#### Step 1: Create Two Supabase Projects

1. **Products Project:**
   - Go to https://supabase.com/dashboard
   - Create new project: "ecommerce-products"
   - Run `supabase-schema.sql` (products table only)
   - Get URL and anon key

2. **Auth Project:**
   - Create new project: "ecommerce-auth"
   - Run all SQL files:
     - `supabase-schema.sql` (cart, orders, etc.)
     - `supabase-user-profiles.sql`
     - `supabase-admin-role.sql`
     - `supabase-wishlist.sql`
   - Get URL and anon key

#### Step 2: Update Environment Variables

Create `.env.local`:

```env
# Products Database (Public Read)
NEXT_PUBLIC_SUPABASE_PRODUCTS_URL=https://your-products-project.supabase.co
NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY=your-products-anon-key

# Authentication Database (User Data)
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://your-auth-project.supabase.co
NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY=your-auth-anon-key
SUPABASE_AUTH_SERVICE_ROLE_KEY=your-auth-service-role-key
```

#### Step 3: Create Separate Supabase Clients

Create `lib/supabase/products.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const createProductsClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY!
  
  return createClient(url, key)
}
```

Update `lib/supabase/client.ts`:

```typescript
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Auth client (for user data, cart, orders)
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Products client (for products only)
export const createProductsClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_ANON_KEY!
  
  return createClient(url, key)
};
```

#### Step 4: Update Components

**For Products (use products client):**
```typescript
import { createProductsClient } from '@/lib/supabase/products'

const productsClient = createProductsClient()
const { data: products } = await productsClient.from('products').select('*')
```

**For User Data (use auth client):**
```typescript
import { createSupabaseClient } from '@/lib/supabase/client'

const supabase = createSupabaseClient()
const { data: cart } = await supabase.from('cart_items').select('*')
```

### Pros
✅ Complete separation  
✅ Can scale independently  
✅ Different security policies  
✅ Can have different admins  
✅ Products can be shared across multiple stores  
✅ Better for multi-brand/multi-tenant  

### Cons
❌ More complex setup  
❌ Two connection strings  
❌ Need to update all product queries  
❌ More expensive (two projects)  

### When to Use
- Multiple brands/stores
- Need to share products across stores
- Need independent scaling
- Enterprise setup

---

## 🎯 Option 3: Hybrid Approach (Products in Separate DB, Auth in Main)

### Structure
```
Supabase Project 1 (Products Only)
└── products table

Supabase Project 2 (Everything Else)
├── auth.users
├── cart_items
├── orders
└── user_profiles
```

### When to Use
- Products managed separately
- Want to share products across multiple apps
- Auth stays with main app

---

## 📋 Migration Checklist (If Separating)

If you choose Option 2 or 3:

### 1. Database Migration
- [ ] Create new Supabase project(s)
- [ ] Run SQL migrations
- [ ] Copy products data (if needed)
- [ ] Verify RLS policies

### 2. Code Updates
- [ ] Create separate client functions
- [ ] Update all product queries
- [ ] Update environment variables
- [ ] Test authentication flow
- [ ] Test cart/orders flow

### 3. Files to Update
- `lib/supabase/client.ts` - Add products client
- `app/page.tsx` - Use products client
- `app/products/[id]/page.tsx` - Use products client
- `components/ProductCard.tsx` - Use products client
- All API routes that query products

### 4. Testing
- [ ] Products load correctly
- [ ] Authentication works
- [ ] Cart functionality works
- [ ] Orders work
- [ ] Admin dashboard works

---

## 🔍 Current Code Structure

### Products (Currently Public)
```typescript
// In app/page.tsx, components/ProductCard.tsx, etc.
const supabase = createSupabaseClient()
const { data: products } = await supabase.from('products').select('*')
```

### User Data (Currently User-Scoped)
```typescript
// In cart, orders, profile pages
const supabase = createSupabaseClient()
const { data: cart } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', user.id) // RLS automatically filters
```

---

## 💡 Recommendation

### For Your Current Setup (Single Store):
**Keep Option 1** (same database, different tables)
- Products are already public
- User data is already isolated via RLS
- No code changes needed
- Simpler to manage

### For Multi-Brand System:
**Use Option 2** (separate projects)
- Products can be shared or per-brand
- Each brand can have separate auth
- Better for scaling

---

## 🚀 Quick Start: Separate Products and Auth

If you want to separate them now:

1. **Create two Supabase projects**
2. **Update `.env.local`** with both URLs/keys
3. **Create `lib/supabase/products.ts`** for products client
4. **Update all product queries** to use products client
5. **Keep auth queries** using existing client

Would you like me to help you implement the separation?

