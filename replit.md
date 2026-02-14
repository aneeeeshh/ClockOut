# Work Tracker

## Overview

A work time tracking application built with React and Express. Users can input their login time and required work hours, and the app calculates logout time, remaining work time, and displays progress with motivational quotes. The application is timezone-aware with specific support for IST (Indian Standard Time).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState for local state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in shared routes file
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Development**: tsx for TypeScript execution, Vite middleware for dev server

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` - defines users table
- **Migrations**: Drizzle Kit with `db:push` command
- **Client Persistence**: localStorage for user preferences (login time, work hours)

### Project Structure
```
├── client/          # React frontend
│   └── src/
│       ├── components/  # UI components including shadcn/ui
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utilities and query client
│       └── pages/       # Route components
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database access layer
│   └── db.ts        # Database connection
├── shared/          # Shared code between client/server
│   ├── schema.ts    # Drizzle database schema
│   └── routes.ts    # API route contracts with Zod validation
└── migrations/      # Database migrations
```

### Key Design Patterns
- **Shared Types**: API routes and database schemas shared between frontend and backend via `@shared/*` path alias
- **Storage Interface**: Abstract IStorage interface for database operations enables testing and flexibility
- **Component Composition**: shadcn/ui components built on Radix primitives for accessibility
- **Theme System**: CSS variables with dark mode support via class toggle

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### UI/Component Libraries
- **Radix UI**: Accessible primitive components (dialog, dropdown, select, etc.)
- **shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library
- **Framer Motion**: Animation library
- **Embla Carousel**: Carousel functionality

### Date/Time
- **date-fns**: Date manipulation utilities
- **date-fns-tz**: Timezone handling, specifically for IST calculations

### Form/Validation
- **Zod**: Schema validation for API responses and form data
- **React Hook Form**: Form state management
- **drizzle-zod**: Generate Zod schemas from Drizzle tables

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Type safety across the stack