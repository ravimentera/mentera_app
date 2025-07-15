import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { GoogleIcon } from "./icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-blue text-white shadow hover:bg-brand-blue-dark/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-brand-blue-hover to-brand-blue-darkest text-white shadow hover:opacity-90 [&>svg]:stroke-white [&>svg]:text-white",
        "gradient-bordered":
          "bg-gradient-to-r from-brand-blue-hover to-brand-blue-darkest text-white shadow hover:opacity-90 [&>svg]:stroke-white [&>svg]:text-white border border-transparent bg-clip-padding",
        success: "bg-green-600 text-white shadow hover:bg-green-700",
        danger: "bg-red-600 text-white shadow hover:bg-red-700",
        "success-light": "bg-green-100 text-green-800 shadow-sm hover:bg-green-200",
        "danger-light": "bg-red-100 text-red-800 shadow-sm hover:bg-red-200",
        "outline-ghost": "text-brand-blue hover:text-brand-blue-hover",
        "gradient-light":
          "bg-gradient-to-r from-brand-blue-light/90 to-brand-blue-light text-brand-blue-dark shadow-sm hover:opacity-90 [&>svg]:text-brand-blue-dark",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

function GoogleSignInButton({
  onClick,
  disabled,
  className,
  children = "Sign up with Google",
  ...props
}: React.ComponentProps<"button"> & {
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-black",
        className,
      )}
      {...props}
    >
      <GoogleIcon width="24" height="24" />
      <span>{children}</span>
    </Button>
  );
}

export { Button, GoogleSignInButton, buttonVariants };
