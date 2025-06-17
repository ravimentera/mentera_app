import { AUTH_ROUTES, REDIRECT_PATHS } from "@/app/constants/route-constants";
import { Button, Input, Label, PasswordInput } from "@/components/atoms";
import { GoogleSignInButton } from "@/components/molecules";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationFormProps {
  labels?: {
    title?: string;
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    submitButton?: string;
    loginText?: string;
    loginLink?: string;
  };
  placeholders?: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  onSubmitSuccess?: (data: FormData) => void;
  onGoogleSignInSuccess?: () => void;
}

export function RegistrationForm({
  labels = {
    title: "Create Account on Mentera",
    fullName: "Full Name",
    email: "Email",
    password: "Create a Password",
    confirmPassword: "Confirm Password",
    terms: "By signing up, you agree to our Terms of Service and Privacy Policy",
    submitButton: "Create Account",
    loginText: "Already member?",
    loginLink: "Login here",
  },
  placeholders = {
    fullName: "Enter your full name",
    email: "Enter your email",
    password: "Enter 8 character password",
    confirmPassword: "Renter your password",
  },
  onSubmitSuccess,
  onGoogleSignInSuccess,
}: RegistrationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || REDIRECT_PATHS.AFTER_LOGIN;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Simulate API call (1 second delay)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set a cookie that expires in 1 day
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      document.cookie = `auth_session=demo_authenticated; expires=${expiryDate.toUTCString()}; path=/`;

      toast.success("Account created successfully! Please complete your profile setup.");

      if (onSubmitSuccess) {
        onSubmitSuccess(formData);
      } else {
        // Redirect to the registration steps flow instead of the returnUrl
        router.push("/register/steps");
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Google sign-up successful!");
      if (onGoogleSignInSuccess) {
        onGoogleSignInSuccess();
      } else {
        router.push(returnUrl);
      }
    }, 1500);
  };

  return (
    <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Form heading */}
        <div className="space-y-2 text-center mb-12 flex justify-between items-start">
          <div className="flex-1">
            <p className="text-3xl font-semibold text-gray-900 text-left">{labels.title}</p>
          </div>
          <div className="flex flex-col justify-end items-end mt-2">
            <p className="text-text-gray-500 text-md text-right">{labels.loginText}</p>
            <Link
              href={AUTH_ROUTES.LOGIN}
              className="text-brand-purple font-semibold text-sm ml-1 hover:underline"
            >
              {labels.loginLink}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {labels.fullName}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={placeholders.fullName}
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {labels.email}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={placeholders.email}
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
              {labels.password}
              <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={placeholders.password}
              className={cn(
                "w-full",
                formData.password && formData.password.length < 8 && "border-destructive",
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {labels.confirmPassword}
              <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={placeholders.confirmPassword}
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <Label htmlFor="terms" className="text-xs text-gray-500">
              {labels.terms}
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-brand-purple hover:bg-brand-purple-hover"
            disabled={
              isLoading ||
              !formData.email ||
              !formData.password ||
              !formData.fullName ||
              !formData.confirmPassword
            }
          >
            {isLoading ? "Creating Account..." : labels.submitButton}
          </Button>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-xs text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <GoogleSignInButton isLoading={isLoading} onGoogleSignIn={handleGoogleSignIn} />
        </form>
      </div>
    </div>
  );
}
