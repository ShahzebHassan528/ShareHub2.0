# API Versioning Architecture Diagram

## Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                          │
│                                                              │
│  Frontend / Mobile App / Third-Party Integration            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌───────────────┐
│  /api/v1/*    │            │   /api/*      │
│  (Versioned)  │            │   (Legacy)    │
│  Recommended  │            │   Deprecated  │
└───────┬───────┘            └───────┬───────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              MIDDLEWARE STACK                       │    │
│  │  1. Helmet (Security Headers)                      │    │
│  │  2. CORS (Cross-Origin)                            │    │
│  │  3. Body Parser (JSON)                             │    │
│  │  4. XSS Clean (Sanitization)                       │    │
│  │  5. HPP (Parameter Pollution)                      │    │
│  │  6. Rate Limiting                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              ROUTE REGISTRATION                     │    │
│  │                                                     │    │
│  │  app.use('/api/v1', v1Routes)                      │    │
│  │  app.use('/api', legacyRoutes)                     │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────┬──────────────────────┘
                       │               │
        ┌──────────────┘               └──────────────┐
        │                                             │
        ▼                                             ▼
┌───────────────────┐                    ┌───────────────────┐
│  routes/v1/       │                    │  routes/legacy.js │
│  index.js         │                    │                   │
│                   │                    │  Registers:       │
│  Registers:       │                    │  - auth.js        │
│  - auth.js        │                    │  - products.js    │
│  - products.js    │                    │  - swaps.js       │
│  - swaps.js       │                    │  - messages.js    │
│  - messages.js    │                    │  - admin.js       │
│  - admin.js       │                    │  - notifications  │
│  - notifications  │                    │  - users.js       │
│  - users.js       │                    │  - categories.js  │
│  - categories.js  │                    │  - dashboard.js   │
│  - dashboard.js   │                    │                   │
└─────────┬─────────┘                    └─────────┬─────────┘
          │                                        │
          │                                        │
          └────────────────┬───────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │     SHARED ROUTE HANDLERS      │
          │                                │
          │  routes/auth.js                │
          │  routes/products.js            │
          │  routes/swaps.js               │
          │  routes/messages.js            │
          │  routes/admin.js               │
          │  routes/notifications.js       │
          │  routes/users.js               │
          │  routes/categories.js          │
          │  routes/dashboard.js           │
          └────────────────┬───────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │      BUSINESS LOGIC            │
          │                                │
          │  - Services                    │
          │  - Models                      │
          │  - Database                    │
          │  - Cache (Redis)               │
          │  - Authorization (CASL)        │
          └────────────────┬───────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │         RESPONSE               │
          │                                │
          │  JSON Response                 │
          │  Status Code                   │
          │  Headers                       │
          └────────────────────────────────┘
```

## File Structure

```
backend/
│
├── server.js                    # Main server file
│   ├── Registers: /api/v1 → routes/v1
│   └── Registers: /api → routes/legacy.js
│
├── routes/
│   │
│   ├── v1/                      # Version 1 (Recommended)
│   │   ├── index.js            # v1 route registration
│   │   ├── auth.js             # /api/v1/auth/*
│   │   ├── products.js         # /api/v1/products/*
│   │   ├── swaps.js            # /api/v1/swaps/*
│   │   ├── messages.js         # /api/v1/messages/*
│   │   ├── admin.js            # /api/v1/admin/*
│   │   ├── notifications.js    # /api/v1/notifications/*
│   │   ├── users.js            # /api/v1/users/*
│   │   ├── categories.js       # /api/v1/categories/*
│   │   └── dashboard.js        # /api/v1/dashboard/*
│   │
│   ├── legacy.js               # Legacy route registration
│   │   └── Registers all /api/* routes
│   │
│   ├── auth.js                 # Shared handler
│   ├── products.js             # Shared handler
│   ├── swaps.js                # Shared handler
│   ├── messages.js             # Shared handler
│   ├── admin.js                # Shared handler
│   ├── notifications.js        # Shared handler
│   ├── users.js                # Shared handler
│   ├── categories.js           # Shared handler
│   └── dashboard.js            # Shared handler
│
├── services/                    # Business logic
├── models/                      # Data models
├── middleware/                  # Middleware
├── config/                      # Configuration
└── utils/                       # Utilities
```

## Version Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                    ENDPOINT MAPPING                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Resource      │  v1 Endpoint          │  Legacy Endpoint  │
│  ─────────────────────────────────────────────────────────  │
│  API Info      │  /api/v1              │  /api             │
│  Auth          │  /api/v1/auth/*       │  /api/auth/*      │
│  Products      │  /api/v1/products/*   │  /api/products/*  │
│  Swaps         │  /api/v1/swaps/*      │  /api/swaps/*     │
│  Messages      │  /api/v1/messages/*   │  /api/messages/*  │
│  Admin         │  /api/v1/admin/*      │  /api/admin/*     │
│  Notifications │  /api/v1/notifications/* │ /api/notifications/* │
│  Users         │  /api/v1/users/*      │  /api/users/*     │
│  Categories    │  /api/v1/categories/* │  /api/categories/*│
│  Dashboard     │  /api/v1/dashboard/*  │  /api/dashboard/* │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Request Examples

### v1 API (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  POST /api/v1/auth/login                                    │
│  ────────────────────────────────────────────────────────   │
│  Request:                                                    │
│    POST http://localhost:5000/api/v1/auth/login            │
│    Content-Type: application/json                           │
│    {                                                         │
│      "email": "user@example.com",                           │
│      "password": "password123"                              │
│    }                                                         │
│                                                              │
│  Response:                                                   │
│    Status: 200 OK                                           │
│    {                                                         │
│      "token": "eyJhbGc...",                                 │
│      "user": { ... }                                        │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  GET /api/v1/products                                       │
│  ────────────────────────────────────────────────────────   │
│  Request:                                                    │
│    GET http://localhost:5000/api/v1/products               │
│                                                              │
│  Response:                                                   │
│    Status: 200 OK                                           │
│    [                                                         │
│      { "id": 1, "title": "Product 1", ... },               │
│      { "id": 2, "title": "Product 2", ... }                │
│    ]                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Legacy API (Backward Compatible)

```
┌─────────────────────────────────────────────────────────────┐
│  POST /api/auth/login                                       │
│  ────────────────────────────────────────────────────────   │
│  Request:                                                    │
│    POST http://localhost:5000/api/auth/login               │
│    Content-Type: application/json                           │
│    {                                                         │
│      "email": "user@example.com",                           │
│      "password": "password123"                              │
│    }                                                         │
│                                                              │
│  Response: (Same as v1)                                     │
│    Status: 200 OK                                           │
│    {                                                         │
│      "token": "eyJhbGc...",                                 │
│      "user": { ... }                                        │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Version Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    VERSION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

Phase 1: DUAL SUPPORT (Current)
┌─────────────────────────────────────────────────────────────┐
│  v1: /api/v1/*        [ACTIVE] [RECOMMENDED]                │
│  Legacy: /api/*       [ACTIVE] [DEPRECATED]                 │
│                                                              │
│  Status: Both versions work simultaneously                   │
│  Action: New development uses v1                            │
└─────────────────────────────────────────────────────────────┘

Phase 2: MIGRATION (Future)
┌─────────────────────────────────────────────────────────────┐
│  v1: /api/v1/*        [ACTIVE] [RECOMMENDED]                │
│  Legacy: /api/*       [ACTIVE] [DEPRECATED] [WARNING]       │
│                                                              │
│  Status: Legacy shows deprecation warnings                   │
│  Action: Clients migrate to v1                              │
└─────────────────────────────────────────────────────────────┘

Phase 3: SUNSET (Future)
┌─────────────────────────────────────────────────────────────┐
│  v1: /api/v1/*        [ACTIVE] [RECOMMENDED]                │
│  Legacy: /api/*       [REMOVED]                             │
│                                                              │
│  Status: Legacy endpoints removed                            │
│  Action: All clients must use v1                            │
└─────────────────────────────────────────────────────────────┘

Phase 4: NEW VERSION (Future)
┌─────────────────────────────────────────────────────────────┐
│  v2: /api/v2/*        [ACTIVE] [RECOMMENDED]                │
│  v1: /api/v1/*        [ACTIVE] [MAINTENANCE]                │
│                                                              │
│  Status: v2 introduced with breaking changes                 │
│  Action: New development uses v2                            │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

```
┌─────────────────────────────────────────────────────────────┐
│                         BENEFITS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ No Breaking Changes                                     │
│     - Existing clients continue working                      │
│     - Gradual migration possible                            │
│     - Zero downtime                                         │
│                                                              │
│  ✅ Clear Versioning                                        │
│     - Version in URL is explicit                            │
│     - Easy to understand                                    │
│     - Simple to test                                        │
│                                                              │
│  ✅ Scalable                                                │
│     - Easy to add v2, v3, etc.                              │
│     - Can maintain multiple versions                        │
│     - Smooth deprecation path                               │
│                                                              │
│  ✅ Developer-Friendly                                      │
│     - Clear documentation                                   │
│     - Easy to debug                                         │
│     - Simple routing                                        │
│                                                              │
│  ✅ Production-Ready                                        │
│     - Tested and verified                                   │
│     - No configuration changes                              │
│     - Works out of the box                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Summary

- **v1**: `/api/v1/*` - Recommended for all new development
- **Legacy**: `/api/*` - Backward compatible, will be deprecated
- **Both**: Work simultaneously with identical responses
- **Future**: Easy to add v2, v3, etc. without breaking changes
