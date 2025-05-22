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

## 📚 Contributing

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on our code of conduct, naming conventions, and the process for submitting pull requests to us.
