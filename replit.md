# AramisTech - Professional IT Solutions

## Overview

AramisTech is a professional IT solutions company website built as a full-stack web application. The system provides a comprehensive business website with contact forms, service information, and team details for a family-owned IT company with 27+ years of experience serving South Florida businesses.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful API endpoints
- **Development Server**: Hot module replacement with Vite integration
- **Session Management**: Built-in session handling with connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations
- **Tables**: 
  - `users` - User authentication
  - `contacts` - Contact form submissions
  - `quick_quotes` - Quick quote requests

## Key Components

### Frontend Components
- **Header**: Navigation with responsive mobile menu
- **Hero**: Landing section with quick quote form
- **Services**: IT service offerings display
- **About**: Company information and trust indicators
- **Team**: Team member profiles
- **Contact**: Comprehensive contact form
- **UI Components**: Complete shadcn/ui component library

### Backend Services
- **Contact API**: Handles contact form submissions (`/api/contact`)
- **Quick Quote API**: Processes quick quote requests (`/api/quick-quote`)
- **Storage Layer**: Abstracted storage interface with memory fallback
- **Validation**: Zod schema validation for all form inputs

### Data Models
- **Contact Schema**: Comprehensive business contact information
- **User Schema**: Basic user authentication structure
- **Quick Quote Schema**: Simplified quote request format

## Data Flow

1. **User Interaction**: Users interact with React components in the browser
2. **Form Submission**: React Hook Form validates data using Zod schemas
3. **API Request**: TanStack React Query sends validated data to Express endpoints
4. **Server Processing**: Express routes validate and process requests
5. **Database Storage**: Drizzle ORM manages PostgreSQL operations
6. **Response Handling**: Success/error responses update UI state

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **PostgreSQL**: Primary database system

### UI & Styling
- **@radix-ui/***: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation
- **@hookform/resolvers**: Zod integration for forms

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Local port 5000, external port 80

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Deployment Target**: Autoscale deployment on Replit
- **Static Assets**: Served through Express with Vite integration

### Database Migrations
- **Schema Changes**: Managed through Drizzle migrations
- **Push Command**: `npm run db:push` for development updates
- **Environment Variables**: `DATABASE_URL` required for all environments

## Changelog

```
Changelog:
- June 26, 2025. Initial setup with professional IT services website
- June 26, 2025. Added PostgreSQL database integration for contact forms and quote requests
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```