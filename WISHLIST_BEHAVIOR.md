# Wishlist Behavior After Purchase

## 🎯 Current Implementation: Remove on Purchase

When a user completes a purchase, any items that were in their cart are automatically removed from their wishlist.

### Why This Approach?

1. **Clear Purpose:** Wishlist remains focused on "things I want to buy"
2. **Less Clutter:** Keeps wishlist clean and actionable
3. **Industry Standard:** Used by Amazon, Etsy, and most e-commerce platforms
4. **Better UX:** User knows exactly what they still want to purchase

---

## 🔄 How It Works

### Flow:
```
User adds items to cart
    ↓
User completes checkout
    ↓
Order is created
    ↓
Cart is cleared
    ↓
✨ Wishlist items matching purchased products are removed
```

### Implementation:

**Files Modified:**
1. `app/checkout/success/page.tsx` - Removes wishlist items after manual order processing
2. `app/api/webhook/route.ts` - Removes wishlist items after Stripe confirmation

**Code:**
```typescript
// Remove purchased items from wishlist
const purchasedProductIds = cartItems.map((item: any) => item.product_id)
if (purchasedProductIds.length > 0) {
  await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .in('product_id', purchasedProductIds)
}
```

---

## 🎨 Alternative Behaviors

### Option 1: Keep Forever (Favorites)
If you want items to STAY in wishlist after purchase:

**Remove this code from both files:**
```typescript
// DELETE these lines:
const purchasedProductIds = cartItems.map((item: any) => item.product_id)
if (purchasedProductIds.length > 0) {
  await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .in('product_id', purchasedProductIds)
}
```

**Pros:** Easy repurchasing, acts as "favorites"
**Cons:** Wishlist gets cluttered over time

---

### Option 2: Keep with "Purchased" Badge
If you want to mark items as purchased but keep them:

**Modify database:**
```sql
ALTER TABLE wishlist
ADD COLUMN purchased_at TIMESTAMP;
```

**Update code to mark instead of delete:**
```typescript
// REPLACE delete logic with:
const purchasedProductIds = cartItems.map((item: any) => item.product_id)
if (purchasedProductIds.length > 0) {
  await supabase
    .from('wishlist')
    .update({ purchased_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('product_id', purchasedProductIds)
}
```

**Update UI to show purchased items differently:**
- Add filter to hide/show purchased items
- Show "Purchased on [date]" badge
- Add "Buy Again" button

**Pros:** Purchase history tracking, easy repurchasing
**Cons:** More complex UI, requires database migration

---

### Option 3: Remove on Add to Cart
If you want items removed when added to cart (before purchase):

**Add to cart logic (wherever user adds to cart):**
```typescript
// After adding to cart:
await supabase
  .from('wishlist')
  .delete()
  .eq('user_id', userId)
  .eq('product_id', productId)
```

**Pros:** Clear separation between wishlist and cart
**Cons:** User loses wishlist item if they remove from cart without purchasing

---

## 🧪 Testing

### Test Scenario:
1. Sign in
2. Add products A, B, C to wishlist
3. Add products A and B to cart
4. Complete checkout
5. Check wishlist

**Expected Result:** Only product C remains in wishlist (A and B removed)

### Manual Testing:
```sql
-- Before purchase:
SELECT * FROM wishlist WHERE user_id = 'your-user-id';

-- Complete a purchase

-- After purchase (should show fewer items):
SELECT * FROM wishlist WHERE user_id = 'your-user-id';
```

---

## 💡 Recommendation

**Stick with current implementation (Remove on Purchase)**

This is the most user-friendly and widely adopted approach. If users want to repurchase:
- They can search for the product again
- Add a "Recently Purchased" section
- Add "Buy Again" on order history page

---

## 🔧 Future Enhancements

Consider adding:

1. **"Purchased" Filter on Wishlist Page**
   - Show/hide purchased items
   - Archive feature

2. **Recently Purchased Section**
   - Separate page showing order history
   - "Buy Again" buttons

3. **Collections/Lists**
   - Multiple wishlists (Wedding, Birthday, etc.)
   - Share lists with others

4. **Smart Suggestions**
   - "You might also like..." based on wishlist
   - "Frequently bought together"

---

## 📊 Database Schema

Current wishlist table:
```sql
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  item_id UUID REFERENCES products(id) NOT NULL,
  item_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);
```

Optional: Add `purchased_at` column:
```sql
ALTER TABLE wishlist
ADD COLUMN purchased_at TIMESTAMP DEFAULT NULL;

-- Create index for filtering
CREATE INDEX idx_wishlist_purchased 
ON wishlist(user_id, purchased_at);
```

---

**Current Behavior:** ✅ Remove on Purchase (Industry Standard)
**Alternative Options:** See above for Keep Forever or Mark as Purchased

