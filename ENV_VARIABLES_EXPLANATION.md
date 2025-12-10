# Environment Variables Explanation

## Understanding NEXT_PUBLIC_ in Next.js

### Why NEXT_PUBLIC_ Exists

In Next.js, environment variables work differently for client-side vs server-side:

- **`NEXT_PUBLIC_*`**: Exposed to the browser (client-side code)
- **Regular env vars**: Only available on the server

### For Supabase: NEXT_PUBLIC_ is Actually Correct!

**Important:** The Supabase **anon key** is designed to be public! It's not a secret.

- ✅ **Anon Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`): Safe to expose, used for client-side operations
- ❌ **Service Role Key**: Never expose this! Only use server-side

### Current Setup (Recommended)

Your current setup is correct:
- `NEXT_PUBLIC_SUPABASE_URL` - Public URL (safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe)

These are used in:
- Client-side code (browser)
- Server-side code (API routes, server components)

## If You Want to Change It

If you still want to use different variable names, you have two options:

### Option 1: Keep NEXT_PUBLIC_ (Recommended)
- Keep current setup
- Works for both client and server
- Simpler to maintain

### Option 2: Separate Client/Server Variables
- Server-side: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Client-side: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- More complex, but gives you more control

## Security Best Practices

1. ✅ **Anon Key**: Can be public (it's in `NEXT_PUBLIC_`)
2. ❌ **Service Role Key**: Never use `NEXT_PUBLIC_` prefix, only server-side
3. ✅ **Database URL**: Can be public (it's just the endpoint)
4. ❌ **Database Password**: Never expose

## Recommendation

**Keep using `NEXT_PUBLIC_` for Supabase variables** because:
- The anon key is meant to be public
- It's simpler to maintain
- It works for both client and server code
- It's the standard practice for Supabase + Next.js

The warning in Vercel is just informing you that these variables will be visible in the browser - which is exactly what you want for Supabase!

