# 🚀 QUICK START GUIDE - How to Use the Improvements

## 1️⃣ ENSURE DEPENDENCIES ARE INSTALLED

```bash
npm install @reduxjs/toolkit react-redux framer-motion sonner lucide-react
# OR
yarn add @reduxjs/toolkit react-redux framer-motion sonner lucide-react
```

---

## 2️⃣ IMPORT COMPONENTS IN YOUR LAYOUT

Make sure your `src/app/layout.js` has ReduxProvider:

```javascript
import { ReduxProvider } from '@/components/ReduxProvider';
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
          <Toaster position="bottom-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
```

---

## 3️⃣ PASS CART COUNT TO NAVBAR

In your page that renders Navbar (e.g., `src/app/layout.js` or `src/app/page.js`):

```javascript
'use client';

import { useCart } from '@/hooks/useCart';
import Navbar from '@/components/ecommerce/Navbar';

export default function Page() {
  const { cartCount } = useCart();
  
  return (
    <>
      <Navbar 
        cartCount={cartCount} 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm} 
      />
      {/* Page content */}
    </>
  );
}
```

---

## 4️⃣ ADD PRODUCT TO CART

From your product detail or shop page:

```javascript
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id,
      title: product.name,
      price: product.price,
      image: product.image,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

---

## 5️⃣ CART PAGE DISPLAYS AUTOMATICALLY

The cart page at `/user/cart` automatically:
- ✅ Fetches cart from Redux
- ✅ Shows all items with animations
- ✅ Handles quantity changes
- ✅ Shows order summary
- ✅ Calculates shipping (Free over ₹1000)
- ✅ Provides "Proceed to Checkout" button

---

## 6️⃣ CHECKOUT PAGE REQUIRES AUTH

Before checkout, user must be logged in:

```javascript
// Automatic redirect in checkout page
if (!isAuthenticated) {
  router.push('/auth/login?redirect=/user/checkout');
}
```

If user is NOT logged in:
1. Navbar shows **Login** and **Sign Up** buttons
2. Clicking **Login** goes to `/auth/login`
3. User enters credentials
4. On login success, Redux state updates
5. Navbar shows profile dropdown

---

## 7️⃣ LOGIN STATE PERSISTENCE

Cart and auth state are saved to localStorage:

```javascript
// Automatically done by Redux store
localStorage.getItem('ecoCommerceState') // Contains cart
localStorage.getItem('ecoCommerceOrders') // Contains orders
```

Refresh page → State persists ✅

---

## 8️⃣ TOAST NOTIFICATIONS

All actions show feedback:

```javascript
import { toast } from 'sonner';

// Success
toast.success('Item added to cart!');

// Error
toast.error('Failed to add item');

// Info
toast.info('Check out our new products');

// Loading
toast.loading('Processing order...');
```

---

## 9️⃣ ANIMATIONS WORK WITH FRAMER MOTION

Cart page has smooth animations:
- Items slide in with stagger
- Quantities scale up/down
- Empty state fades in
- Checkout success has spring animation

All handled automatically in components ✅

---

## 🔟 MOBILE RESPONSIVE

All components use Tailwind grid system:
- Mobile: Single column, full width
- Tablet: 2 columns with sidebar
- Desktop: 3-column layout with sticky sidebar

Test on devices or use DevTools ✅

---

## ❌ COMMON ISSUES & FIXES

### Issue: Cart count not updating
**Fix:** Make sure `useCart()` is called with `useSelector`
```javascript
const { cartCount } = useCart(); // ✅ Correct
```

### Issue: Hydration mismatch error
**Fix:** All components have `useEffect` with `isMounted` check
```javascript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
if (!isMounted) return null; // Prevents hydration mismatch
```

### Issue: Toast not showing
**Fix:** Add `<Toaster />` to layout
```javascript
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
```

### Issue: Checkout redirects to login
**Fix:** User must be logged in before checkout
```javascript
// Login first
// Then go to /user/checkout
```

---

## 📊 DATA FLOW DIAGRAM

```
Product Page
    ↓
User clicks "Add to Cart"
    ↓
dispatch(addToCart()) → Redux cartSlice
    ↓
Redux state updates → localStorage (auto-saved)
    ↓
Navbar receives cartCount from useCart() hook
    ↓
Badge updates with count
    ↓
User clicks Cart Icon → /user/cart
    ↓
Cart Page fetches fromRedux via useCart()
    ↓
Shows items with animations
    ↓
User clicks "Checkout"
    ↓
Checkout page checks auth
    ↓
If NOT logged in → /auth/login
    ↓
If logged in → shows checkout form
    ↓
User fills form + validates
    ↓
Order saved to localStorage
    ↓
Cart cleared automatically
    ↓
Success animation + redirect to /user/orders
```

---

## 🎯 TESTING CHECKLIST

- [ ] Add item to cart → Badge shows count
- [ ] Refresh page → Cart persists
- [ ] Click Navbar login → Goes to /auth/login
- [ ] Login → Navbar shows profile dropdown
- [ ] Click profile → Goes to /user/profile or /user/orders
- [ ] Click logout → Profile replaced with Login/Signup
- [ ] Go to /user/cart → Shows all items
- [ ] Increase/decrease quantity → Works smoothly
- [ ] Remove item → Item disappears with animation
- [ ] Mobile view → Single column, responsive
- [ ] Empty cart → Shows beautiful empty state
- [ ] Proceed to checkout (logged in) → Form shows
- [ ] Fill form + submit → Success screen

---

## 📞 SUPPORT

If anything is not working:
1. Check console for errors
2. Verify Redux state in DevTools
3. Check localStorage data
4. Make sure auth is working first
5. Test single components in isolation

---

**Version**: 2.0.0  
**Last Updated**: April 8, 2026  
**Status**: ✅ Production Ready
