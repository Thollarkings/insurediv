# Top Notch Insurance Brokers — Project Documentation

---

## 1. Project Overview

### Purpose
A modern, premium insurance company website prototype built with React, Vite, Tailwind CSS, and Convex for real-time backend functionality. It serves as the digital presence for Top Notch Insurance Brokers, providing public-facing insurance service information and internal staff management tools.

### Core Objectives
1. Showcase insurance products (Life Assurance, Health Elite, Estate Shield, Auto Premium) to potential customers
2. Enable digital customer inquiries via a contact form integrated with Convex real-time database
3. Provide a secure, code-protected staff enrollment system for creating admin and staff accounts
4. Facilitate real-time internal staff communication via a live chat admin portal
5. Maintain a responsive, brand-consistent UI using the company color scheme (navy #002147, gold #D4AF37) across all pages

### Target Audience
- **Primary**: Individuals and businesses seeking insurance products (life, health, property, auto)
- **Secondary**: Top Notch Insurance Brokers staff and administrators who manage inquiries and internal communication

### Problem Statement
The project solves the need for a professional online presence for Top Notch Insurance Brokers, replacing manual customer inquiry handling with digital submissions, enabling secure internal staff management without third-party tools, and providing real-time staff communication capabilities. It eliminates reliance on disjointed legacy systems (PocketBase, Prisma, Express) by using a unified Convex backend.

---

## 2. Technical Architecture

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v6, Lucide React (icons) |
| Backend / Realtime | Convex (real-time database, serverless functions), Convex Auth (`@convex-dev/auth`, Password provider) |
| Tooling | TypeScript (Convex functions), ESLint, Vercel (deployment) |
| Legacy Components | Express.js, PocketBase, Prisma (unused in current Convex-based workflow) |

### System Components
1. **Frontend SPA**: React-based single-page application with client-side routing via React Router v6
2. **Convex Backend**: Hosted Convex deployment handling database storage, authentication, and server functions
3. **Static Assets**: Public images for hero/about pages, favicon, and SVG icons
4. **Legacy Express Server**: Localhost:3001 API referenced in older frontend code (`Admin.jsx`, `Enroll.jsx`) but not used in the core Convex workflow

### Data Flow
1. **Customer Inquiry**:
   User submits Contact form → Convex `addInquiry` mutation (`convex/inquiries.ts`) → `inquiries` table
2. **Staff Enrollment**:
   User enters enrollment code → `/enroll` page → Convex `createStaffUser` action (`convex/staff.ts`) → Creates Convex Auth account + `staffUsers` table record
3. **Admin Live Chat**:
   Authenticated staff sends message → Convex `send` mutation (`convex/messages.ts`) → `messages` table; `listMessages` query returns messages with resolved author names from `staffUsers` table

### Dependencies
#### Production Dependencies (from `package.json`)
- `@auth/core`: ^0.37.0
- `@convex-dev/auth`: ^0.0.91
- `convex`: ^1.36.1
- `react`: ^19.2.5
- `react-dom`: ^19.2.5
- `react-router-dom`: ^6.30.3
- `tailwindcss`: ^4.2.4
- `lucide-react`: ^0.511.0
- *Legacy: `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcrypt`*

#### Development Dependencies
- `@eslint/js`: ^10.0.1
- `@tailwindcss/vite`: ^4.2.4
- `@types/react`: ^19.2.14
- `@vitejs/plugin-react`: ^6.0.1
- `eslint`: ^10.2.1
- `vite`: ^8.0.10

### Infrastructure Requirements
- **Local Development**: Node.js 18+, Convex CLI (`npx convex`)
- **Hosted Deployment**: Convex deployment (free tier available), Vercel (frontend hosting)
- **Environment Variables**:
  - `VITE_CONVEX_URL`: Convex deployment URL (provided when running `npx convex dev`)
  - `CONVEX_DEPLOYMENT`: Convex deployment identifier
  - `ENROLLMENT_CODE` (optional): Custom enrollment code (defaults to `diven45-2026`)

---

## 3. Feature Breakdown

### Core Functionality
1. **Public Pages**:
   - Landing: Cinematic hero section, insurance service cards, call-to-action buttons
   - About: Company story, stats, core values, leadership team
   - Contact: Full inquiry form with plan selection, integrated with Convex backend
2. **Staff Management**:
   - Code-protected enrollment portal (`/enroll`) for creating staff/admin accounts
   - Staff list view, staff deletion with code confirmation
3. **Admin Portal**:
   - Password-protected login via Convex Auth
   - Real-time live chat with message history, message clearing
4. **UI/UX**:
   - Responsive mobile-first design across all pages
   - Sticky glassmorphism navbar with gold/navy branding
   - Consistent color scheme and typography

### MVP vs Planned Features
#### Implemented MVP Features
- All public pages (Landing, About, Contact)
- Staff enrollment system with code verification
- Admin portal with live chat
- Convex backend integration for inquiries, staff, and messages
- Responsive design and brand-consistent UI

#### Planned Features (from `IMPLEMENTATION_SUMMARY.md`)
- Role-based access control (admin vs staff permissions)
- Email verification for new staff accounts
- Password reset functionality
- Audit logs for staff account changes and logins
- Two-factor authentication (2FA) for staff
- Staff account status management (active/inactive)
- Activity monitoring (last login, action tracking)

### Edge Cases Handled
- Duplicate staff email prevention during enrollment
- Invalid enrollment code rejection
- Unauthenticated access to admin portal redirected to login
- Fallback author names ("Unknown") for messages with missing staff records
- Inquiry form input validation
- Mobile-responsive layout for all pages

---

## 4. Setup & Usage Instructions

### Prerequisites
- Node.js 18+ installed
- Free Convex account (sign up at [convex.dev](https://convex.dev))
- Git (for repository cloning)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Thollarkings/insurediv.git
   cd insurediv
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Convex (follow prompts to link or create a Convex project):
   ```bash
   npx convex dev
   ```
4. Create a `.env.local` file in the project root with your Convex URL:
   ```env
   VITE_CONVEX_URL=your_convex_deployment_url_here
   ```
   (Your Convex URL is displayed when running `npx convex dev`)

### Running Locally
Run the following in two separate terminals:
```bash
# Terminal 1: Start Convex backend
npx convex dev

# Terminal 2: Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Example Usage Workflows
#### Customer Inquiry
1. Navigate to `http://localhost:5173/contact`
2. Fill in name, email, select a plan, and add a message
3. Submit the form → inquiry is saved to the Convex `inquiries` table

#### Staff Enrollment
1. Navigate directly to `http://localhost:5173/enroll` (not linked in main navigation)
2. Enter the enrollment code `diven45-2026`
3. Fill in staff name, email, password, and select a role (staff/admin)
4. Submit → staff account is created, and can log in at `/admin`

#### Admin Chat
1. Navigate to `http://localhost:5173/admin`
2. Log in with enrolled staff credentials
3. Send messages in the real-time chat, view message history, or clear all messages

---

## 5. Project Structure

### Directory Tree
```
insurancecompany/
├── .agents/                          # Agent configuration files
├── .env                               # Environment variables (gitignored)
├── .gitignore                         # Git ignore rules
├── AGENTS.md                          # Agent-specific guidelines
├── CLAUDE.md                          # Claude AI guidelines
├── eslint.config.js                   # ESLint configuration
├── IMPLEMENTATION_SUMMARY.md          # Staff system implementation details
├── index.html                         # Vite entry HTML
├── LICENSE                           # Apache 2.0 License
├── package.json                       # Project dependencies and scripts
├── package-lock.json                  # Dependency lockfile
├── problem.md                         # Staff name display bug documentation
├── README.md                          # Project overview and setup
├── server.js                          # (Legacy) Express server (unused in core workflow)
├── skills-lock.json                   # Agent skills lockfile
├── tailwind.config.js                 # Tailwind CSS configuration
├── TEST_CREDENTIALS.md                # Test account instructions
├── vercel.json                        # Vercel deployment configuration
├── vite.config.js                     # Vite build configuration
├── convex/                            # Convex backend functions and schema
│   ├── auth.config.ts                 # Convex Auth configuration
│   ├── auth.js                        # Password provider setup
│   ├── http.js                        # Convex HTTP endpoints
│   ├── inquiries.ts                   # Inquiry-related Convex functions
│   ├── messages.ts                    # Chat message Convex functions
│   ├── schema.ts                      # Database schema definition
│   ├── staff.ts                       # Staff management Convex functions
│   ├── tsconfig.json                  # TypeScript config for Convex
│   └── _generated/                    # Auto-generated Convex types and API
│       ├── api.d.ts
│       ├── api.js
│       ├── dataModel.d.ts
│       ├── server.d.ts
│       ├── server.js
│       └── ai/
│           ├── ai-files.state.json
│           └── guidelines.md
├── public/                            # Static assets
│   ├── about-bg.png                   # About page hero background
│   ├── favicon.svg                    # Site favicon
│   ├── hero-bg.png                    # Landing page hero background
│   └── icons.svg                      # Site icons
├── src/                               # Frontend source code
│   ├── App.css                        # App-level styles
│   ├── App.jsx                        # Main app component with routing
│   ├── index.css                      # Tailwind and global styles
│   ├── main.jsx                       # Vite entry point
│   ├── assets/                        # Frontend assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/                    # Reusable components
│   │   ├── AuthProvider.jsx           # Convex Auth provider
│   │   ├── Navbar.jsx                 # Sticky glassmorphism navbar
│   │   └── ProtectionCode.jsx        # (Unused) Protection code component
│   ├── pages/                         # Page components
│   │   ├── About.jsx                  # About us page
│   │   ├── Admin.jsx                  # Admin portal (legacy Express API references)
│   │   ├── Contact.jsx                # Contact/inquiry page
│   │   ├── Enroll.jsx                 # Staff enrollment page (legacy Express API references)
│   │   └── Landing.jsx                # Landing page
│   └── services/                      # (Unused) PocketBase service
│       └── pocketbase.js
├── lib/                               # (Unused) Prisma and utility files
│   ├── prisma.ts
│   └── protectionCode.ts
├── prisma/                            # (Unused) Prisma schema
│   └── schema.prisma
└── pages/                             # (Unused) Next.js-style pages
    └── enroll.tsx
```

### Code Organization Rationale
- **Separation of concerns**: Frontend (`src/`) and backend (`convex/`) are fully decoupled, with Convex handling all data storage, authentication, and server logic
- **Component reuse**: Reusable UI components (Navbar, AuthProvider) are stored in `src/components/`, while page-specific components are in `src/pages/`
- **Domain-grouped backend functions**: Convex functions are organized by feature domain (`staff.ts`, `messages.ts`, `inquiries.ts`) for maintainability
- **Legacy file isolation**: Unused files from earlier project iterations (Prisma, PocketBase, Express, Next.js pages) are kept in separate directories but not integrated into the current workflow

---

## 6. Contribution Guidelines

### Issue Reporting
- Use GitHub Issues for bug reports and feature requests
- Include the following in issue descriptions:
  - Steps to reproduce the issue
  - Expected vs actual behavior
  - Screenshots (if applicable)
  - Environment details (Node.js version, browser, OS)
- Tag issues with appropriate labels: `bug`, `enhancement`, `documentation`

### Pull Request Submission Rules
- Fork the repository and create a feature branch from `main`
- Follow project coding standards and include tests for new features
- Update documentation (`README.md`, `IMPLEMENTATION_SUMMARY.md`) for significant changes
- Reference related issues in the PR description
- Ensure all ESLint checks pass before submitting

### Coding Standards
- **Frontend**: Use React functional components with hooks, Tailwind CSS for all styling, ES6+ syntax
- **Backend**: Use TypeScript for all Convex functions, follow Convex best practices (see `convex/_generated/ai/guidelines.md`)
- **Naming Conventions**:
  - PascalCase for React components
  - camelCase for variables and functions
  - kebab-case for CSS classes
- **Linting**: Adhere to rules defined in `eslint.config.js`

### Testing Requirements
- Complete the manual testing checklist (from `IMPLEMENTATION_SUMMARY.md`) for all UI changes
- No automated test framework is currently configured; manual testing is required for all changes
- Test Convex functions via the Convex dashboard or frontend integration before submitting PRs

---

## 7. Known Limitations & Roadmap

### Current Bugs
1. **Staff names display as "Unknown" in chat**: Mismatch between frontend auth user lookup and backend message author storage (documented in `problem.md`)
2. **Legacy API references**: `Admin.jsx` and `Enroll.jsx` reference a legacy Express API (`localhost:3001`) instead of the Convex backend, causing functionality gaps if the Express server is not running
3. **Hardcoded enrollment code**: Enrollment code is hardcoded in `convex/staff.ts` and `src/pages/Enroll.jsx`, with limited environment variable configuration

### Unimplemented Features
- Role-based access control for admin portal
- Mobile-responsive Navbar menu
- Inquiry status management (reply to inquiries, mark as "replied")
- Email verification and password reset for staff accounts

### Short-Term Planned Improvements (1-3 Months)
1. Fix staff name "Unknown" bug by aligning frontend and backend user lookup logic
2. Migrate `Admin.jsx` and `Enroll.jsx` to use Convex API instead of legacy Express server
3. Move enrollment code to environment variable, remove hardcoded values
4. Add mobile-responsive Navbar menu
5. Implement inquiry status management for admin portal

### Long-Term Planned Improvements (3-12 Months)
1. Role-based access control for admin portal
2. Two-factor authentication (2FA) for staff accounts
3. Email verification and password reset functionality
4. Audit logs and activity monitoring for staff actions
5. Remove all legacy unused files (Prisma, PocketBase, Express server, Next.js pages)
6. Add automated testing framework (Jest, React Testing Library)

---

## 8. License & Attribution

### Licensing Terms
- Licensed under the **Apache License 2.0** (full terms in `LICENSE` file)
- Copyright 2026 Top Notch Insurance Brokers
- Permitted: Use, reproduction, distribution, and modification (with proper attribution)
- Disclaimer: Software is provided "AS IS" with no warranties of any kind

### Third-Party Assets and Credits
- **Icons**: Lucide React (https://lucide.dev/)
- **UI Frameworks**: React (https://react.dev/), Tailwind CSS (https://tailwindcss.com/)
- **Backend**: Convex (https://convex.dev/), Convex Auth (https://convex.dev/auth)
- **Build Tools**: Vite (https://vitejs.dev/), ESLint (https://eslint.org/)
- **Public Images**: `hero-bg.png`, `about-bg.png` (copyright Top Notch Insurance Brokers)

### Contributor List
- Primary Contributor: Thollarkings (https://github.com/Thollarkings)
- No additional contributors are listed in project files
