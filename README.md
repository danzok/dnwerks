# DNwerks - SMS Campaign Management Platform

<div align="center">

![DNwerks Logo](https://via.placeholder.com/200x80/1e293b/ffffff?text=DNwerks)

**A powerful, modern SMS campaign management platform built with Next.js 16 and Supabase**

[![Next.js](https://img.shields.io/badge/Next.js-16.0+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Environment Setup](#️-environment-setup)
- [📁 Project Structure](#-project-structure)
- [🔧 Development Workflow](#-development-workflow)
- [🚀 Deployment](#-deployment)
- [📚 API Integration](#-api-integration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Campaign Management**: Create, schedule, and track SMS campaigns
- **Customer Management**: Import, organize, and segment customers
- **Template System**: Create reusable message templates with variables
- **Real-time Analytics**: Track delivery rates, opens, and engagement
- **Scheduling**: Advanced campaign scheduling with timezone support

### 👥 User Management
- **Admin Approval Workflow**: Secure user registration with admin approval
- **Role-based Access**: Different permissions for admins and regular users
- **Invite System**: Generate invite codes for team members
- **Profile Management**: User settings and preferences

### 📱 SMS Features
- **Personalization**: Dynamic variables in messages (firstName, lastName, etc.)
- **MMS Support**: Send images and media with messages
- **Delivery Tracking**: Real-time delivery status updates
- **Compliance**: Built-in opt-out management and compliance features

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface with shadcn/ui components
- **Dark Mode**: Built-in dark/light theme support
- **Mobile Responsive**: Works seamlessly on all devices
- **Accessibility**: WCAG compliant design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Twilio account (for SMS functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dnwerks.git
   cd dnwerks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then fill in your environment variables (see [Environment Setup](#️-environment-setup)).

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + useState/useReducer
- **Forms**: React Hook Form with Zod validation

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom workflow
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime subscriptions

### External Services
- **SMS**: Twilio API
- **Link Shortening**: Bitly API
- **Hosting**: Vercel (recommended)
- **Analytics**: Custom analytics dashboard

### Development Tools
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library
- **Development Standards**: Context7 integration

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres?sslmode=require

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=http://localhost:3000/api/webhooks/twilio

# Short Link Service (Bitly)
BITLY_ACCESS_TOKEN=your_bitly_token_here

# Vercel Cron Secret
CRON_SECRET=your_cron_secret_here
```

### Setting Up Services

#### 1. Supabase Setup

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Project Settings > API
3. **Run the database setup**:
   ```bash
   npm run db:setup
   ```
4. **Configure authentication** in Supabase Dashboard:
   - Enable email authentication
   - Set up custom SMTP (optional)
   - Configure redirect URLs

#### 2. Twilio Setup

1. **Create a Twilio account** at [twilio.com](https://twilio.com)
2. **Get a phone number** from the Twilio Console
3. **Find your credentials** in the Twilio Dashboard:
   - Account SID
   - Auth Token
4. **Configure webhooks** in Twilio phone number settings:
   - Inbound SMS: `https://your-domain.com/api/webhooks/twilio`

#### 3. Bitly Setup (Optional)

1. **Create an account** at [bitly.com](https://bitly.com)
2. **Generate a Generic Access Token** in your account settings
3. **Add the token** to your environment variables

## 📁 Project Structure

```
dnwerks/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   ├── campaigns/         # Campaign-related components
│   │   ├── customers/         # Customer management components
│   │   └── templates/         # Template components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── ui-types.ts        # UI-specific types
│   │   ├── schema.ts          # Database schema types
│   │   └── utils.ts           # Utility functions
│   └── scripts/               # Database setup scripts
├── public/                    # Static assets
├── docs/                      # Documentation
├── .env.example               # Environment template
├── .env.local                 # Local environment (gitignored)
├── .gitignore                 # Git ignore file
├── components.json            # shadcn/ui configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## 🔧 Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:setup     # Set up database schema
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier

# Context7
npm run context7:validate  # Validate code standards
```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled, all files must be typed
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **File Naming**: kebab-case for files, PascalCase for components
- **Imports**: Absolute imports with `@/` prefix

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and follow the code style guidelines

3. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```

4. **Commit your changes** with descriptive messages
   ```bash
   git commit -m "feat: add new campaign scheduling feature"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Deploy the `out` folder** to your hosting provider

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_APP_URL`: Your production domain
- `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Production service role key
- `TWILIO_WEBHOOK_URL`: Production webhook URL
- `CRON_SECRET`: Generate a secure secret for cron jobs

## 📚 API Integration

### Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `customers` - Customer contact information
- `campaigns` - SMS campaign data
- `campaign_messages` - Individual message records
- `campaign_templates` - Reusable message templates
- `invite_codes` - User invitation system

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

#### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

#### Webhooks
- `POST /api/webhooks/twilio` - Twilio SMS webhook handler

### Real-time Subscriptions

The app uses Supabase Realtime for:

- Live campaign status updates
- Real-time message delivery tracking
- Instant notification updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our code style
4. **Add tests** for your changes
5. **Ensure all tests pass** (`npm run test`)
6. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Development Standards

This project follows the [Context7](https://context7.dev/) development standards for:

- Code organization and structure
- TypeScript best practices
- Component design patterns
- Testing strategies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Twilio](https://twilio.com/) - SMS and communication APIs
- [Context7](https://context7.dev/) - Development standards and patterns

## 📞 Support

If you have any questions or need support:

- **Open an issue** on GitHub
- **Join our Discord** (link coming soon)
- **Email us** at support@dnwerks.com

---

<div align="center">
  <p>Made with ❤️ by the DNwerks team</p>
  <p>⭐ If you like this project, please give it a star!</p>
</div>