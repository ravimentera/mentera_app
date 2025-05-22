# Contributing to Mentera App

Thank you for your interest in contributing to the Mentera App! This guide will help you understand our development standards and workflow.

## Table of Contents

- [Code Structure](#code-structure)
- [Naming Conventions](#naming-conventions)
  - [Files](#files)
  - [Directories](#directories)
  - [Components](#components)
  - [Import Patterns](#import-patterns)
  - [Props and Interfaces](#props-and-interfaces)
  - [Helper Functions](#helper-functions)
  - [Constants](#constants)
- [Component Organization](#component-organization)
- [Styling Guidelines](#styling-guidelines)
- [State Management](#state-management)
- [Pull Request Process](#pull-request-process)
- [Code Quality Checks](#code-quality-checks)

## Code Structure

This project follows the Next.js 14 app router pattern, with a clear separation of concerns:

```
mentera_app/
├── app/                 # Next.js app router directories 
│   ├── (auth)/          # Auth-related routes
│   ├── (dashboard)/     # Dashboard routes
│   ├── api/             # API routes
├── components/          # Reusable components
│   ├── atoms/           # Smallest UI components
│   ├── molecules/       # Combinations of atoms
│   ├── organisms/       # Larger components
│   ├── templates/       # Page layouts
├── public/              # Static assets
├── styles/              # Global styles
```

## Naming Conventions

We follow strict naming conventions to maintain consistency across the codebase.

### Files

#### React Component Files (PascalCase)

All React component files must use PascalCase. This makes component files easily distinguishable from other types of files.

```
✅ Good examples:
- Button.tsx
- ProfileCard.tsx
- AuthForm.tsx
- UserTable.tsx
- NavigationBar.tsx

❌ Bad examples:
- button.tsx
- profile-card.tsx
- authForm.tsx
- user_table.tsx
```

#### Special Files

For special files like layouts, pages, and routes in Next.js, follow the Next.js naming conventions:

```
- layout.tsx        # Layout files
- page.tsx          # Page components in app router
- loading.tsx       # Loading states
- error.tsx         # Error states
- not-found.tsx     # 404 pages
```

#### Utility/Helper Files

Use kebab-case for utility files:
```
- api-utils.ts
- date-helpers.ts
- form-validation.ts
```

#### Configuration Files 

Use kebab-case for configuration files:
```
- next-config.js
- tailwind.config.js
```

#### Test Files

Use the same name as the file being tested with `.test.tsx` or `.spec.tsx` suffix:
```
- Button.test.tsx
- ProfileForm.spec.tsx
```

### Directories

#### Component Directories (kebab-case)

All component directories should use kebab-case for consistent navigation and imports:

```
✅ Good examples:
- components/auth-marketing-section/
- components/user-profile/
- components/form-stepper/
- components/treatment-pill/

❌ Bad examples:
- components/AuthMarketingSection/
- components/userProfile/
- components/FormStepper/
- components/treatment_pill/
```

#### Organizational Directories

We organize components by atomic design principles:

```
- components/atoms/        # Base components like buttons, inputs
- components/molecules/    # Combinations of atoms
- components/organisms/    # Complex components
- components/templates/    # Page layouts
- components/ui/           # UI-specific components
```

#### Next.js Route Groups

Use parentheses for route groups:
```
- app/(auth)/
- app/(dashboard)/
```

### Components

#### Component Names

React component names should always use PascalCase:

```typescript
// Good
export function Button() { ... }
export const ProfileCard = () => { ... }

// Bad
export function button() { ... }
export const profileCard = () => { ... }
```

### Import Patterns

When importing components, follow these patterns:

```typescript
// For component files (PascalCase)
import { Button } from "@/components/atoms/Button";
import { ProfileForm } from "@/components/organisms/ProfileForm";

// For directory imports (kebab-case)
import { AuthMarketingSection } from "@/components/organisms/auth-marketing-section";
import { TreatmentPill } from "@/components/molecules/treatment-pill";
```

### Props and Interfaces

Interface names should use PascalCase with a descriptive suffix:

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

interface UserCardProps {
  user: User;
  isEditable: boolean;
}
```

### Helper Functions

Helper functions and utilities should use camelCase:

```typescript
// Good
export function formatDate(date: Date): string { ... }
export const calculateTotal = (items: Item[]): number => { ... }

// Bad
export function FormatDate(date: Date): string { ... }
export const Calculate_Total = (items: Item[]): number => { ... }
```

### Constants

Constants should use UPPER_SNAKE_CASE for global constants:

```typescript
// Good
export const API_BASE_URL = 'https://api.mentera.com';
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Bad
export const apiBaseUrl = 'https://api.mentera.com';
export const maxUploadSize = 5 * 1024 * 1024;
```

## Component Organization

We organize components based on atomic design principles:

- **Atoms**: Smallest UI components that can't be broken down further (e.g., buttons, inputs, labels)
- **Molecules**: Combinations of atoms that form a functional unit (e.g., form fields, search bars)
- **Organisms**: Complex UI components composed of molecules and/or atoms (e.g., navigation bars, forms)
- **Templates**: Page layouts that arrange organisms, molecules, and atoms

## Styling Guidelines

- Use Tailwind CSS for styling components
- Prefer utility classes over custom CSS
- For complex components, consider using the `cn` utility for conditional class names
- Follow a mobile-first approach to responsive design

## State Management

- Use React hooks for component-level state
- Redux is used for global state management
- API data fetching should use Next.js data fetching patterns

## Pull Request Process

1. Create a new branch from `main` with a descriptive name
2. Make your changes following the conventions above
3. Update tests as necessary
4. Run linting and tests locally before submitting
5. Create a pull request with a clear description of changes
6. Request a review from at least one team member

## Code Quality Checks

Before submitting a PR, ensure:

1. All code follows the naming conventions
2. ESLint shows no errors or warnings
3. Tests pass
4. The app builds without errors

You can run the naming convention check script to automatically verify your changes:
```bash
./scripts/check-naming-conventions.sh
```

## Benefits of Consistent Naming

By following these naming standards consistently:

1. Code becomes more readable and predictable
2. Team collaboration is more efficient
3. File organization remains consistent
4. Imports become more intuitive
5. Refactoring and maintenance are simplified

## Questions?

If you have any questions about contributing, please reach out to the team lead. 