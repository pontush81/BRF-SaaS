# Library Directory Structure

## Supabase Authentication Files

The Supabase authentication implementation is organized as follows:

### Main Files

- `src/supabase-client.ts` - Client-side Supabase configuration, safe to import in client components
- `src/supabase-server.ts` - Server-side Supabase configuration with special handling for Next.js App Router, only for server components
- `src/lib/supabase-minimal.ts` - Minimal Supabase constants and utilities shared by both client and server

### Path Aliasing and Export Structure

- `src/supabase-server/index.ts` - Re-exports from `supabase-server.ts` to make the `@/supabase-server` import work with path aliases
- `src/supabase-client/index.ts` - Re-exports from `supabase-client.ts` to make the `@/supabase-client` import work with path aliases
- `src/lib/supabase.ts` - Legacy compatibility file that re-exports from `supabase-minimal.ts` for backward compatibility

### Authentication Utilities

- `src/lib/auth/server-utils.ts` - Server-side utilities for fetching the current user
- `src/lib/auth/roleUtils.ts` - Utilities for handling user roles and permissions

## Best Practices

When working with Supabase authentication:

1. In client components, import from `@/supabase-client`
2. In server components, import from `@/supabase-server`
3. For shared constants, import from `@/lib/supabase-minimal`
4. Avoid importing from `@/lib/supabase` in new code (it exists only for backward compatibility)

## Environment Configuration

The following environment variables are required for Supabase functionality:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for server-only operations)
``` 