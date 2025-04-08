# Mentera AI

A modern, production-ready booking platform for MedSpa services built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Features a comprehensive UI component system with an atomic design approach, dark/light theme support, and responsive design.

## 🌟 Features

- **Modern Authentication Flow** - Secure login/registration system
- **Comprehensive Dashboard** - Overview of appointments, stats, and user activity
- **Appointment Management** - Schedule, view, and manage client appointments
- **User Profile System** - Complete user profile with customization options
- **Preference Settings** - User-specific settings including theme, notifications, and regional preferences
- **Dark/Light Mode** - Seamless theme switching with smooth transitions
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Interactive Charts** - Data visualization with animated charts (Line, Bar, Donut)
- **Atomic Design System** - Modular component architecture for better maintainability
- **Form Validation** - Robust validation using Formik and Yup
- **State Management** - Redux Toolkit implementation for global state
- **Code Quality Tools** - Biome linting, formatting, and type checking
- **Git Hooks** - Automated code quality checks with Lefthook
- **Comprehensive Testing** - Jest setup for unit and integration tests

## 🚀 Tech Stack

- **Framework:** Next.js 15.2.4
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Component Library:** Shadcn UI components
- **State Management:** Redux Toolkit
- **Form Handling:** Formik, Yup, React Hook Form
- **Notifications:** Sonner
- **Testing:** Jest, React Testing Library
- **Linting/Formatting:** Biome
- **Git Hooks:** Lefthook
- **Icons:** Radix UI Icons, Lucide React

## 📋 Prerequisites

- Node.js 18.0 or higher
- pnpm 8.0 or higher

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/ravimentera/mentera_app
cd mentera_app

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📝 Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the development server         |
| `pnpm build`        | Build the application for production |
| `pnpm start`        | Start the production server          |
| `pnpm lint`         | Run ESLint and Biome to lint code    |
| `pnpm format`       | Format code with Biome               |
| `pnpm biome:check`  | Run Biome checks only                |
| `pnpm biome:fix`    | Fix Biome issues automatically       |
| `pnpm biome:format` | Format code with Biome               |
| `pnpm typecheck`    | Check TypeScript types               |
| `pnpm test`         | Run Jest tests                       |
| `pnpm test:watch`   | Run tests in watch mode              |
| `pnpm clean`        | Clean .next and node_modules cache   |
| `pnpm clean-dev`    | Clean and restart development server |

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── forgot-password/      # Password recovery
│   │   └── layout.tsx            # Auth layout wrapper
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── dashboard/            # Main dashboard page
│   │   ├── appointments/         # Appointment management
│   │   ├── profile/              # User profile page
│   │   ├── settings/             # User settings
│   │   └── layout.tsx            # Dashboard layout wrapper
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components (Atomic Design)
│   ├── atoms/                    # Atomic components
│   │   ├── avatar.tsx            # User avatar
│   │   ├── button.tsx            # Button component
│   │   ├── input.tsx             # Input fields
│   │   ├── label.tsx             # Form labels
│   │   ├── skeleton.tsx          # Loading skeletons
│   │   ├── switch.tsx            # Toggle switches
│   │   └── tooltip.tsx           # Tooltips
│   ├── molecules/                # Molecular components
│   │   ├── tabs.tsx              # Tab navigation
│   │   └── ...
│   ├── organisms/                # Organism components
│   │   ├── charts/               # Data visualization charts
│   │   │   ├── BarChart.tsx      # Bar chart component
│   │   │   ├── LineChart.tsx     # Line chart component
│   │   │   └── DonutChart.tsx    # Donut chart component
│   │   ├── card.tsx              # Card component
│   │   ├── header.tsx            # Application header
│   │   ├── footer.tsx            # Application footer
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── table.tsx             # Data tables
│   ├── templates/                # Template components
│   │   ├── AuthLayout.tsx        # Authentication layout
│   │   ├── DashboardLayout.tsx   # Dashboard layout
│   │   └── page-layout.tsx       # Generic page layout
│   ├── index.ts                  # Component exports
│   ├── redux-provider.tsx        # Redux provider
│   ├── theme-provider.tsx        # Theme provider
│   └── theme-toggle.tsx          # Theme toggle component
├── lib/                          # Utility functions and hooks
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Redux store
│   │   ├── services/             # API services
│   │   └── slices/               # Redux slices
│   ├── mock-data.ts              # Mock data for development
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
│   ├── icons/                    # Icon assets
│   └── images/                   # Image assets
├── __tests__/                    # Test files
├── biome.json                    # Biome configuration
├── lefthook.yml                  # Git hooks configuration
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── next.config.js                # Next.js configuration
```

## 🔄 Authentication Flow

1. Root URL (`/`) redirects to login page
2. Login page accepts credentials and sets an `auth_session` cookie
3. Protected routes (dashboard, appointments, profile, settings) validate this cookie
4. Missing cookie redirects users to the login page
5. Logout clears the cookie and redirects to login

## 🎨 UI Component Architecture

The project follows atomic design principles:

- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Groups of atoms (forms, tab groups, dropdowns)
- **Organisms**: Complex UI components (headers, sidebars, charts)
- **Templates**: Page layouts and structural components
- **Pages**: Complete views composed of organisms and templates

## 🧪 Testing

The project includes a Jest setup for testing React components:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🔍 Code Quality

Code quality is maintained through:

- **Biome**: For linting and formatting
- **TypeScript**: For type checking
- **Lefthook**: Git hooks for pre-commit and pre-push quality checks

```bash
# Check code quality
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

## 📦 Deployment

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## 📄 License

MIT

## Test Change

This is a test change to verify the Git hooks are working properly.
