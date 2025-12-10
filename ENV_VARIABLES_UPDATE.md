# Environment Variables Update

## What Changed

The code now supports **both** variable naming conventions:

### Server-Side Code (Not Exposed to Browser)
- `SUPABASE_URL` (preferred for server-side)
- `SUPABASE_ANON_KEY` (preferred for server-side)
- Falls back to `NEXT_PUBLIC_*` if not set

### Client-Side Code (Exposed to Browser)
- `NEXT_PUBLIC_SUPABASE_URL` (required for client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for client-side)

## Updated Files

✅ **Server-Side Files Updated:**
- `src/lib/supabase-server.ts` - Server components
- `src/middleware.ts` - Middleware
- `lib/supabase-server.ts` - Legacy server file

✅ **Client-Side Files (No Change):**
- `src/lib/supabase.ts` - Still uses `NEXT_PUBLIC_*` (required)

## Vercel Environment Variables

You can now use **either** naming convention in Vercel:

### Option 1: Use Regular Variables (Server-Side Only)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: Use Only NEXT_PUBLIC_ (Works Everywhere)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Recommendation

**For Vercel, use Option 2** (only `NEXT_PUBLIC_*`):
- Simpler to manage
- Works for both client and server
- The anon key is safe to expose anyway

**For local development**, you can use Option 1 if you prefer:
- Server-side uses regular vars (not in browser)
- Client-side uses `NEXT_PUBLIC_*` (in browser)

## Security Note

⚠️ **Remember:**
- ✅ Anon key can be public (it's designed for this)
- ❌ Service role key should NEVER use `NEXT_PUBLIC_` prefix
- ✅ Database URL can be public (it's just an endpoint)

## How It Works

The code now checks for regular env vars first, then falls back to `NEXT_PUBLIC_*`:

```typescript
// Server-side code
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

This gives you flexibility while maintaining compatibility.

