# BRF Handbok - Core Features Design

This document outlines the design and implementation plan for the two core features of the BRF Handbok application:

1. Content Management (Handbook Pages)
2. User Administration

## 1. Content Management System

The content management system allows BRF administrators and editors to create, organize, and publish handbook content for members to read.

### Data Model

```
Handbook
├── Section 1
│   ├── Page 1.1
│   ├── Page 1.2
│   └── ...
├── Section 2
│   ├── Page 2.1
│   └── ...
└── ...
```

#### Database Schema

```prisma
model Handbook {
  id              String    @id @default(uuid())
  title           String
  description     String?
  organizationId  String    @unique
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  sections        Section[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Section {
  id              String    @id @default(uuid())
  title           String
  description     String?
  sortOrder       Int       @default(0)
  handbookId      String
  handbook        Handbook  @relation(fields: [handbookId], references: [id], onDelete: Cascade)
  pages           Page[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([handbookId])
}

model Page {
  id              String    @id @default(uuid())
  title           String
  content         String    @db.Text
  sortOrder       Int       @default(0)
  published       Boolean   @default(false)
  sectionId       String
  section         Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  publishedAt     DateTime?
  publishedBy     String?
  version         Int       @default(1)
  previousVersion String?

  @@index([sectionId])
}
```

### Implementation Plan

#### 1. Editor Interface

- **Admin Dashboard**: Enhanced section for content management
- **Section Manager**: Interface to create/edit handbook sections
- **Page Editor**: Rich text editor for creating handbook pages
  - Markdown or WYSIWYG editor
  - Image and fileupload functionality
  - Version history

#### 2. Member Viewing Interface

- **Handbook Landing Page**: Overview of available sections
- **Section View**: Display pages within a section
- **Page View**: Responsive content display with navigation
- **Search**: Full-text search across handbook content

#### 3. API Endpoints

```
GET    /api/handbook              - Get handbook structure
GET    /api/handbook/sections     - Get all sections
POST   /api/handbook/sections     - Create new section
GET    /api/handbook/sections/:id - Get specific section with pages
PUT    /api/handbook/sections/:id - Update section
DELETE /api/handbook/sections/:id - Delete section

GET    /api/handbook/pages        - Get all pages (with filters)
POST   /api/handbook/pages        - Create new page
GET    /api/handbook/pages/:id    - Get specific page content
PUT    /api/handbook/pages/:id    - Update page
DELETE /api/handbook/pages/:id    - Delete page
POST   /api/handbook/pages/:id/publish - Publish page
```

## 2. User Administration

The user administration system allows BRF administrators to manage member accounts, roles, and permissions.

### Data Model

#### Database Schema Extensions

```prisma
enum UserRole {
  ADMIN
  EDITOR
  MEMBER
}

model UserOrganization {
  id               String    @id @default(uuid())
  userId           String
  organizationId   String
  role             UserRole  @default(MEMBER)
  isDefault        Boolean   @default(true)
  joinedAt         DateTime  @default(now())
  invitedBy        String?
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([userId])
  @@index([organizationId])
}

model Invitation {
  id               String    @id @default(uuid())
  email            String
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  role             UserRole  @default(MEMBER)
  status           String    @default("pending") // pending, accepted, expired
  token            String    @unique
  invitedBy        String
  createdAt        DateTime  @default(now())
  expiresAt        DateTime

  @@index([organizationId])
  @@index([token])
}
```

### Implementation Plan

#### 1. Member Management Interface

- **Member List**: View and manage all BRF members
- **Add Member**: Form to add new members or send invitations
- **Edit Member**: Update member details and roles
- **Remove Member**: Process for removing members

#### 2. Invitation System

- **Invitation Creation**: Generate and send invites to new members
- **Invitation Tracking**: Monitor pending/accepted invitations
- **Signup Process**: Special flow for invited users

#### 3. API Endpoints

```
GET    /api/organization/members              - Get all members
POST   /api/organization/members              - Add new member
PUT    /api/organization/members/:id          - Update member
DELETE /api/organization/members/:id          - Remove member

POST   /api/organization/invitations          - Create invitation
GET    /api/organization/invitations          - List invitations
DELETE /api/organization/invitations/:id      - Cancel invitation
POST   /api/join/:token                       - Accept invitation
```

## Implementation Priorities

1. **First Phase (MVP)**:
   - Basic handbook structure (sections and pages)
   - Simple content editor
   - Member listing and role management

2. **Second Phase**:
   - Enhanced content editor with media support
   - Invitation system
   - Search functionality

3. **Third Phase**:
   - Content versioning
   - Member dashboard
   - Advanced permissions

## Development Approach

We'll follow these principles during implementation:

- **Mobile-first design**: Ensure all interfaces work well on mobile devices
- **Progressive enhancement**: Start with core functionality and enhance incrementally
- **Tenant isolation**: Ensure proper data isolation between organizations
- **Test coverage**: Create test cases for all critical functionality
- **Documentation**: Document all API endpoints and component usage 