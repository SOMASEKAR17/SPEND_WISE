# Expense Tracker Application

## Overview

This is a full-stack expense tracking application built with React, Express, and PostgreSQL. The app provides a mobile-first design for managing personal expenses with features including bank account management, expense categorization, transaction recording, and comprehensive reporting with data visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts library for data visualization (bar charts, pie charts, line charts)
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Hosting**: Neon Database (serverless PostgreSQL)
- **Data Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with Vite development server integration
- **Storage Pattern**: Repository pattern with in-memory storage for development and database storage for production

### Data Schema
- **Bank Accounts**: Account management with name, group, and description
- **Expense Categories**: Hierarchical categorization with name, group, and category fields
- **Transactions**: Core transaction records linking bank accounts to expense categories with amounts and dates
- **Database Migrations**: Drizzle Kit for schema management and migrations

### API Design
- **RESTful Endpoints**: CRUD operations for bank accounts, expense categories, and transactions
- **Analytics Endpoints**: Specialized endpoints for dashboard analytics and reporting
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging

### Development Workflow
- **Monorepo Structure**: Shared schema and types between client and server
- **Build Process**: Vite for frontend bundling, esbuild for server bundling
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/)
- **Type Safety**: End-to-end TypeScript with shared validation schemas

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: TypeScript ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation and schema definition

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Modern icon library

### Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Static type checking
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution environment for development

### Data Visualization
- **recharts**: React charting library for analytics dashboards
- **date-fns**: Modern date utility library

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not actively used in current implementation)