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
- June 26, 2025. Created professional IP address lookup tool at /ip-lookup with public and local IP detection, location information, copy functionality, AramisTech branding, complete navigation header, and footer integration
- June 26, 2025. Added Support dropdown menu to navigation with Customer Portal, Windows 10 Upgrade, and IP Lookup as sub-items, including mobile responsive design and click-outside functionality
- June 26, 2025. Added complete navigation header and footer to Windows 10 upgrade page for consistent user experience across all service pages
- June 26, 2025. Added dynamic countdown timer to Windows 10 upgrade page showing exact time remaining until October 14, 2025 support end date with real-time updates
- June 26, 2025. Fixed flashing background image issue on Windows 10 upgrade page by removing dynamic cache-busting parameter
- June 26, 2025. Fixed navigation links to work from any page - main navigation links now navigate to home page with proper section scrolling, and Support dropdown links scroll to top of target pages
- June 26, 2025. Added comprehensive chatbot with AramisTech branding, intelligent responses for all services, Windows 10 upgrade info, contact details, pricing guidance, and professional conversation flow
- June 26, 2025. Enhanced chatbot with extensive technical support responses covering hardware issues, software problems, cybersecurity, network troubleshooting, business applications, and emergency scenarios - all designed to lead users toward contacting AramisTech for professional assistance
- June 26, 2025. Made chatbot language more personal using "call us" and "email us" throughout all responses for family-business feel
- June 26, 2025. Rebuilt chatbot technical detection system with intelligent keyword categorization for hardware, network, software, email, and security issues - provides specific technical guidance while directing users to AramisTech for professional help
- June 26, 2025. Enhanced chatbot with AI-powered issue analysis engine featuring confidence scoring, contextual responses, dynamic technical guidance, and multi-layered detection to provide professional-level technical support that leads to AramisTech consultations
- June 26, 2025. Updated social proof popup timing to appear every 1-2 minutes instead of every 15-45 seconds for better user experience
- June 26, 2025. Rebuilt chatbot with advanced pattern recognition system featuring weighted keyword analysis, confidence scoring, specialized printer support, contextual understanding, and enhanced debugging for intelligent technical issue detection and lead generation
- June 26, 2025. Fixed menu management system by removing duplicate menu items and properly implementing Support dropdown with Customer Portal, Windows 10 Upgrade, and IP Lookup sub-items - admin interface now shows correct navigation structure
- June 26, 2025. Completed dynamic navigation system connecting admin menu management to frontend - menu changes in dashboard appear immediately on website, includes Free Consultation button for lead generation
- June 26, 2025. Fixed menu reordering error where NaN values caused database failures - added data validation and proper error handling for drag-and-drop menu organization
- June 26, 2025. Fixed menu item parentId validation error "Expected number, received null" by updating client and server schemas to properly handle null values for top-level menu items
- June 26, 2025. Created professional AI Development service page at /ai-development with comprehensive AI/ML solutions, development process, trust indicators, and AramisTech branding - added to main navigation menu
- June 27, 2025. Fixed critical router conflicts caused by external URLs in database menu items - created server-side download proxy system for Microsoft Quick Assist and RustDesk downloads to eliminate wouter router errors and ensure proper navigation functionality
- June 27, 2025. Resolved 404 navigation errors by fixing empty href handling in Support dropdown menu - implemented proper navigation logic for parent menu items without links and enhanced download URL processing
- June 27, 2025. Integrated ChatGPT AI into chatbot system with OpenAI API - created intelligent customer service assistant with AramisTech branding, professional responses about IT services, and lead generation focus
- June 27, 2025. Updated chatbot icon color to orange matching AramisTech logo branding for consistent visual identity
- June 27, 2025. Enhanced chatbot button with slower pulse animation and outer glow hover effect for improved user engagement
- June 27, 2025. Added intelligent fallback response system to chatbot for when OpenAI API hits rate limits - provides contextual AramisTech responses based on message content
- June 27, 2025. Switched chatbot from ChatGPT to Google Gemini 2.5 Flash for improved performance and better rate limits while maintaining all AramisTech branding and intelligent responses
- June 27, 2025. Updated chatbot interface to display "Powered by Google Gemini" instead of ChatGPT branding for accurate service identification
- June 27, 2025. Changed chatbot footer from "Powered by Google Gemini" to "Call us today" for stronger lead generation call-to-action
- June 27, 2025. Updated chatbot submit button to orange AramisTech branding matching logo colors for consistent visual identity
- June 27, 2025. Enhanced chatbot responses with personal family-business tone, removed markdown formatting, and emphasized 27+ years experience for better brand representation
- June 27, 2025. Rebuilt fallback response system with specific contextual responses for printer issues, computer problems, network troubles, security threats, email issues, and other technical categories to eliminate repetitive generic responses
- June 27, 2025. Created comprehensive knowledge base system with 6 categories (Troubleshooting, Cybersecurity, Network & Internet, Hardware Issues, Software Installation, Data Recovery) and 21 detailed articles covering common IT topics, admin management interface, public browsing pages, SEO optimization, and AramisTech-branded content designed to generate leads while providing valuable technical guidance
- June 27, 2025. Expanded knowledge base with comprehensive mobile email setup guides covering Office 365 Exchange and Google Workspace configuration for iPhone and Android devices, including troubleshooting guides and platform comparison articles to support business email deployment decisions
- June 27, 2025. Built comprehensive live chat system replacing standalone chatbot with AI assistant that seamlessly transfers to human agents, real-time WebSocket communication, admin dashboard interface for managing conversations, complete conversation history, and enhanced chat button with slow pulse animation and orange glow hover effects matching AramisTech branding
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
WHMCS Integration: Decided on billing.aramistech.com subdomain migration - implementation postponed for a few days
Current WHMCS: Located at aramistech.com/abilling on GoDaddy hosting
User Feedback: Project progress rated as "coming out great" - satisfied with current implementation
```

## Pending Tasks

```
- WHMCS subdomain migration from /abilling to billing.aramistech.com
- API credentials configuration
- Customer communication about billing portal move
- Complete documentation available in WHMCS-Migration-Plan.md
```