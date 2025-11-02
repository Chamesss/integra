# Integra - AI Coding Agent Instructions

## Architecture Overview

**Integra** is an Electron-based desktop application for managing artisanal business operations, built with TypeScript + React frontend and Electron backend.

### Project Structure

```
src/                    # React frontend (Vite + React Query)
electron/               # Electron backend (Node.js + Sequelize)
├── models/            # Sequelize ORM models
├── services/          # Business logic layer
├── controllers/       # IPC request handlers
├── repositories/      # Data access layer
├── types/             # TypeScript interfaces
└── handlers.ts        # IPC method registrations
```

## Key Patterns & Conventions

### Frontend-Backend Communication

- **IPC Pattern**: All data communication uses Electron IPC via `window.ipcRenderer.invoke(method, params)`
- **Method Naming**: `{entity}:{action}` format (e.g., `quote:create`, `client:getAll`)
- **Custom Hooks**: Use `useFetchAll<T>({ method, search_key, queryParams })` for listings, `useMutation<T, R>()` for operations
- **No Direct Database Access**: Frontend never directly accesses Sequelize models

### Data Flow Architecture

```
React Components → Custom Hooks (useFetchAll/useMutation) → IPC → Handlers → Controllers → Services → Repositories → Sequelize Models
```

### Backend Service Layer Pattern

- **CoreService**: Base class providing CRUD operations for all entities
- **Entity Services**: Extend CoreService with business-specific logic
- **Repository Pattern**: CoreRepo provides database operations, entity-specific repos extend it
- **Result Types**: All operations return `IResult<T>` or `IResults<T>` with success/error handling

### Quote Management System

- **Snapshot Pattern**: Quotes store client/product snapshots (not references) for historical accuracy
- **Tax Calculation**: Product-specific TVA rates with proper discount application logic in `utils/product-price.ts`
- **Currency**: Uses Tunisian Dinar (TND) via `formatCurrency()` utility
- **Form Management**: React Hook Form + FormProvider pattern for complex quote forms

### TypeScript Conventions

- **Strict Typing**: All models use Sequelize's `InferAttributes<T>` and `InferCreationAttributes<T>`
- **DTO Pattern**: Separate Create/Update/Query DTOs for each entity in `electron/types/`
- **Enum Usage**: Extensive use of TypeScript enums for status fields and categories

## Development Commands

```bash
# Development
pnpm run dev          # Start both Electron and Vite dev servers

# Database
pnpm run db:create    # Create database
pnpm run db:migrate   # Run migrations
pnpm run db:seed      # Seed initial data

# Building
pnpm run build        # Build for production
pnpm run dist         # Create distributable packages
```

## Critical Integration Points

### WooCommerce Sync

- Background sync processes in `hooks/useSetupProccess.ts`
- Attribute/Product/Category sync via dedicated controllers
- Data transformation between WooCommerce and local models

### React Query Configuration

- Global QueryClient setup in `src/main.tsx`
- Custom `useFetchAll` hook handles pagination, search, sorting automatically
- Query keys follow pattern: `[method, params, uniqueKey]`

### Reusable Components

- `ClientIcon`: Displays individual/company icons consistently
- `useFetchAll`: Standardized data fetching with built-in pagination/search
- Custom UI components extend shadcn/ui base components

## Business Domain Specifics

### Quote Workflow

1. Client selection via searchable dropdown
2. Product selection with stock validation
3. Tax calculations per product + global discount application
4. Snapshot creation preserves data integrity
5. Status management (Draft → Active → Accepted/Rejected)

### Multi-entity Relationships

- Products → Categories, Attributes, Variations
- Quotes → Clients (snapshot), Products (snapshot array)
- Users → Roles → Permissions for access control

When working on this codebase, prioritize understanding the snapshot pattern for quotes, IPC communication layer, and the custom hooks for data management.
