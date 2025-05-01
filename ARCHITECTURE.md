# BRF-SaaS Architecture Overview

This document outlines the technical architecture for transforming MallBRF1 into a multi-tenant SaaS product.

## System Architecture

### High-Level Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Client App    │      │   API Gateway   │      │  Database Layer │
│  (React/Next.js)│──────┤  (Express/Node) │──────┤   (Supabase)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  │
                         ┌────────┴────────┐
                         │  Service Layer  │
                         │                 │
                         └─────────────────┘
```

### Multi-Tenant Architecture

We'll implement a multi-tenant architecture using the "shared database, shared schema" approach:

1. Single database instance
2. All tenants share the same tables
3. Row-level isolation using `brf_id` column and RLS policies
4. Middleware to set the current tenant context

## Database Schema Changes

### New Tables

**Organizations Table**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  address TEXT,
  contact_email TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Organization Invitations Table**
```sql
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Modified Tables

All existing tables will be updated to include the following column:

```sql
ALTER TABLE [table_name] ADD COLUMN organization_id UUID REFERENCES organizations(id);
CREATE INDEX [table_name]_organization_id_idx ON [table_name](organization_id);
```

Tables to modify:
- users
- pages
- bookings
- documents
- settings
- etc.

### Row Level Security Policies

For each table:

```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY [table_name]_isolation_policy ON [table_name]
  USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

## Authentication & Authorization

### User Model Changes

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'member';
  organization_id: string | null; // null for super_admin
  organizations?: Organization[]; // For users with access to multiple orgs
  created_at: string;
  updated_at: string;
}
```

### Authentication Flow

1. User navigates to `{subdomain}.brfsaas.com`
2. System resolves subdomain to organization
3. Authentication context includes organization ID
4. On successful login, tenant context is set
5. All subsequent requests include organization context

### Multi-Organization Access

For users that belong to multiple organizations:
- Store organization memberships in junction table
- Allow switching between organizations
- Maintain separate sessions for each organization

## API Layer Changes

### Middleware for Tenant Context

```typescript
// middleware/tenant-context.ts
import { Request, Response, NextFunction } from 'express';
import { getOrganizationBySubdomain } from '../services/organization';

export async function tenantContext(req: Request, res: Response, next: NextFunction) {
  try {
    const subdomain = req.headers['x-tenant-subdomain'] as string;
    
    if (!subdomain) {
      return res.status(400).json({ error: 'Tenant subdomain is required' });
    }
    
    const organization = await getOrganizationBySubdomain(subdomain);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Set organization context for this request
    req.organizationId = organization.id;
    
    // Set Supabase RLS parameters
    req.supabaseClient = supabase.withHeaders({
      'x-organization-id': organization.id
    });
    
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
```

### Supabase RLS Configuration

```sql
-- Function to set current organization
CREATE OR REPLACE FUNCTION set_current_organization()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', current_setting('request.headers.x-organization-id', true), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on each request
CREATE OR REPLACE FUNCTION trigger_set_current_organization()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM set_current_organization();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Frontend Implementation

### Subdomain Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain (ignore 'www' and localhost)
  const subdomain = hostname.split('.')[0];
  if (subdomain !== 'www' && !hostname.includes('localhost')) {
    // Set tenant context for API calls
    const response = NextResponse.next();
    response.headers.set('x-tenant-subdomain', subdomain);
    return response;
  }
  
  // Handle main domain
  if (url.pathname === '/' && (subdomain === 'www' || hostname.includes('localhost'))) {
    return NextResponse.redirect(new URL('/register', url));
  }
  
  return NextResponse.next();
}
```

### Auth Context Updates

```typescript
// context/AuthContext.tsx
interface AuthContextType {
  currentUser: User | null;
  currentOrganization: Organization | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (user: User, organization: Organization) => void;
  logout: () => Promise<boolean>;
  switchOrganization: (organization: Organization) => void;
}

export const AuthProvider: React.FC = ({ children }) => {
  // ... existing code
  
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  
  // Add organization switching functionality
  const switchOrganization = async (organization: Organization) => {
    setCurrentOrganization(organization);
    localStorage.setItem('currentOrganization', JSON.stringify(organization));
    
    // Update API client with new organization context
    api.defaults.headers.common['x-tenant-subdomain'] = organization.subdomain;
  };
  
  // ... rest of implementation
};
```

## Subscription Management

### Stripe Integration

```typescript
// services/stripe.ts
import Stripe from 'stripe';
import { getOrganization, updateOrganization } from './organization';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCustomer(organizationId: string, email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organization_id: organizationId
      }
    });
    
    await updateOrganization(organizationId, {
      stripe_customer_id: customer.id
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

export async function createSubscription(organizationId: string, priceId: string) {
  try {
    const organization = await getOrganization(organizationId);
    
    if (!organization.stripe_customer_id) {
      throw new Error('Organization has no Stripe customer ID');
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: organization.stripe_customer_id,
      items: [{ price: priceId }],
      metadata: {
        organization_id: organizationId
      }
    });
    
    // Store subscription details in database
    await createSubscriptionRecord(organizationId, subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}
```

### Feature Flags System

```typescript
// utils/features.ts
const PLAN_FEATURES = {
  free: ['pages_basic', 'admin_users_1'],
  basic: ['pages_basic', 'admin_users_3', 'documents_basic'],
  professional: ['pages_advanced', 'admin_users_unlimited', 'documents_advanced', 'booking_system'],
  enterprise: ['pages_advanced', 'admin_users_unlimited', 'documents_advanced', 'booking_system', 'api_access', 'white_label']
};

export function hasFeature(organization: Organization, featureKey: string): boolean {
  if (!organization || !organization.subscription_plan) {
    return false;
  }
  
  const plan = organization.subscription_plan;
  return PLAN_FEATURES[plan].includes(featureKey);
}
```

## Deployment Architecture

### Environment Setup

We'll maintain three environments:
- Development (dev)
- Staging (test)
- Production (prod)

Each environment will have its own:
- Supabase project
- Stripe test/live credentials
- Environment-specific configuration

### CI/CD Pipeline

GitHub Actions workflow for automated deployment:
1. Run tests
2. Build application
3. Deploy to appropriate environment
4. Run post-deployment tests

## Migration Strategy

1. Create data export scripts for MallBRF1
2. Transform data to fit new schema (add organization_id)
3. Import to BRF-SaaS
4. Verify data integrity and isolation 