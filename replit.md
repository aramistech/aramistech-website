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
- **Exit Intent Popup**: Customizable popup to capture leaving visitors
- **UI Components**: Complete shadcn/ui component library

### Backend Services
- **Contact API**: Handles contact form submissions (`/api/contact`)
- **Quick Quote API**: Processes quick quote requests (`/api/quick-quote`)
- **Admin Dashboard**: Protected interface for content management
- **Exit Intent Management**: Admin controls for popup customization
- **Media Management**: File upload and image storage system
- **Analytics Integration**: Google Analytics 4 tracking and reporting
- **Storage Layer**: Abstracted storage interface with PostgreSQL
- **Validation**: Zod schema validation for all form inputs

### Data Models
- **Contact Schema**: Comprehensive business contact information
- **User Schema**: Admin user authentication and management
- **Quick Quote Schema**: Simplified quote request format
- **Review Schema**: Customer testimonial management
- **Menu Schema**: Website navigation structure
- **Exit Intent Popup Schema**: Popup content and styling configuration
- **Media Files Schema**: Image upload and management system

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
- June 26, 2025. Integrated Google Places API for authentic customer reviews - awaiting AramisTech Place ID for final connection
- June 26, 2025. Built complete review management system with database storage, admin interface at /admin/reviews, and delete functionality
- June 26, 2025. Created login-protected backend dashboard at /admin/dashboard with authentication system, moved admin reviews inside dashboard, added menu management for website navigation with support for submenus
- June 26, 2025. Enhanced menu management with drag-and-drop reordering functionality for intuitive navigation control
- June 26, 2025. Added comprehensive admin user management system with create, edit, delete, and password change capabilities for dashboard access control
- June 26, 2025. Implemented exit intent popup system with mouse tracking detection, customizable messaging, images, colors, button color customization, and admin management interface
- June 26, 2025. Built WordPress-style media library with file upload, image management, and integration with exit intent popup for easy image selection
- June 26, 2025. Integrated Google Analytics 4 with comprehensive tracking system for visitor behavior, session duration, click tracking, conversion events, and traffic source analysis
- June 26, 2025. Updated navigation menu hover effects to use brand orange color matching the logo
- June 26, 2025. Created professional Windows 10 upgrade service page with urgency messaging, comprehensive service details, contact form integration, and navigation menu placement
- June 26, 2025. Updated Windows 10 page "Call Now" button styling with orange text and blue hover effect to match brand colors
- June 26, 2025. Implemented comprehensive WHMCS billing system integration with separate hosting architecture, customer portal, API proxy, service management, and secure authentication
- June 26, 2025. Created professional IP address lookup tool at /ip-lookup with public and local IP detection, location information, copy functionality, and AramisTech branding
- June 26, 2025. Updated social proof popup timing to appear every 1-2 minutes instead of every 15-45 seconds for better user experience
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
WHMCS Integration: Decided on billing.aramistech.com subdomain migration - implementation postponed for a few days
Current WHMCS: Located at aramistech.com/abilling on GoDaddy hosting
```

## Pending Tasks

```
- WHMCS subdomain migration from /abilling to billing.aramistech.com
- API credentials configuration
- Customer communication about billing portal move
- Complete documentation available in WHMCS-Migration-Plan.md
```