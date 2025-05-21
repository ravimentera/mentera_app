import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GoogleSignInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  isLoading?: boolean;
  onGoogleSignIn: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = "Continue with Google",
  isLoading = false,
  onGoogleSignIn,
  className,
  ...props
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onGoogleSignIn}
      disabled={isLoading}
      className={cn("w-full relative flex justify-center", className)}
      {...props}
    >
      <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
      <p>{isLoading ? "Please wait..." : label}</p>
    </Button>
  );
};
