import { LOGIN_INITIAL_VALUES } from "@/app/constants/auth-constants";
import { AUTH_ROUTES, REDIRECT_PATHS } from "@/app/constants/route-constants";
import { Button, Input, Label, PasswordInput } from "@/components/atoms";
import { useLazyGenerateTokenQuery } from "@/lib/store/api";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || REDIRECT_PATHS.AFTER_LOGIN;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(LOGIN_INITIAL_VALUES);
  const [generateToken] = useLazyGenerateTokenQuery();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call (1 second delay)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set a cookie that expires in 1 day (existing dummy flow)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      document.cookie = `auth_session=demo_authenticated; expires=${expiryDate.toUTCString()}; path=/`;

      // Generate and store token in Redux
      await generateToken();

      toast.success("Login successful! Welcome to Mentera.");
      router.push(returnUrl);
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Google sign-in successful!");
      router.push(returnUrl);
    }, 1500);
  };

  return (
    <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Form heading */}
        <div className="space-y-2 text-center mb-12 flex justify-between items-start">
          <div className="flex-1">
            <p className="text-3xl font-semibold text-gray-900 text-left">Login to Mentera</p>
          </div>
          <div className="flex flex-col justify-end items-end mt-2">
            <p className="text-text-gray-500 text-md text-right">New member?</p>
            <Link
              href={AUTH_ROUTES.REGISTER}
              className="text-brand-purple font-semibold text-sm ml-1 hover:underline"
            >
              Create Account here
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email<span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "w-full",
                formData.email &&
                  !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
                  "border-destructive",
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password<span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div></div>
            <Link
              href={AUTH_ROUTES.FORGOT_PASSWORD}
              className="text-text-gray-500 text-sm hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-brand-purple hover:bg-brand-purple-hover"
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? "Please wait..." : "Login"}
          </Button>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-xs text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full relative bg-secondary hover:bg-gray-100"
          >
            <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
            <span className="text-foreground ml-2">Login with Google</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
