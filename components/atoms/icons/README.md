# Icon System

This icon system provides a unified approach to using icons across the Mentera-AI application. It combines the standard Radix UI Icons for common UI elements with custom icons for specific application needs.

## Installation

Make sure you have the Radix UI Icons package installed:

```bash
npm install @radix-ui/react-icons
```

## Usage

```tsx
import { 
  // Radix icons
  CheckIcon, 
  Cross1Icon, 
  HomeIcon,
  
  // Custom icons
  MenteraIcon,
  StarIcon,
  SuccessIcon,
  GoogleIcon
} from "@/components/atoms/icons";

// Use icons in your components:
function MyComponent() {
  return (
    <div>
      <HomeIcon className="w-4 h-4" />
      <StarIcon filled={true} className="w-4 h-4 text-yellow-500" />
      <MenteraIcon className="w-6 h-6 text-primary" />
    </div>
  );
}
```

## Icon Types

### Radix UI Icons

We use [Radix UI Icons](https://www.radix-ui.com/icons) as our primary icon set. These icons have a consistent style, are designed specifically for React, and offer good accessibility features.

All Radix icons are exported from `@/components/atoms/icons`.

### Custom Icons

For specialized icons not available in Radix UI, we maintain custom components with a consistent style:

- `MenteraIcon`: The Mentera-AI logo icon for branding
- `StarIcon`: Star icon for ratings with filled/outline variants
- `SuccessIcon`: Check icon with circle for success states
- `GoogleIcon`: Google logo for authentication

## Props

All icons accept standard SVG props plus the following:

### Radix UI Icons
- `className`: For styling (width, height, color)
- All standard SVG props

### Custom Icons
- `className`: For styling
- `filled`: For `StarIcon` to toggle between filled and outline states
- All standard SVG props

## Server Component Support

Both Radix UI icons and our custom Icon component work in React Server Components without any special configuration.

## Styling

Icons inherit text color by default (`currentColor`), so you can style them using text color classes:

```jsx
<HomeIcon className="text-blue-500" />
```

For explicit colors, pass the color prop:

```jsx
<HomeIcon color="#3b82f6" />
```

To adjust size, use either the width/height props or CSS classes:

```jsx
<HomeIcon width={24} height={24} />
// or
<HomeIcon className="w-6 h-6" />
```

## Adding New Icons

### Using Radix UI Icons

1. If the icon you need exists in Radix UI, simply import it in the component where it's needed:

```tsx
import { PlusIcon } from "@/components/atoms/icons";
```

2. If you're using it in multiple places, add it to the exports in `components/atoms/icons/index.ts`:

```ts
export {
  // ... existing exports
  PlusIcon,
  // ... other exports
} from "@radix-ui/react-icons";
```

### Creating Custom Icons

If Radix UI doesn't have an equivalent:

1. Create a new file in `components/atoms/icons/YourIconName.tsx`
2. Implement the icon using the Radix UI style guidelines (15×15 viewBox, consistent stroke width)
3. Add export to `components/atoms/icons/index.ts`

## Best Practices

1. Prefer Radix UI icons when available
2. Maintain the "use client" directive on custom icon components
3. Ensure proper sizing consistency (usually via className)
4. For accessibility:
   - Use appropriate title/aria-label attributes
   - Ensure sufficient color contrast
5. Scalable size (the base size is 15×15 in viewBox, but should be scaled via props)