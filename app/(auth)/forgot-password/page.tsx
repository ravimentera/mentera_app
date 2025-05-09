"use client";

import { AUTH_ROUTES } from "@/app/constants/route-constants";
import { Button, Input, Label } from "@/components/atoms";
import { SuccessIcon } from "@/components/atoms/icons";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto">
          <SuccessIcon
            width="24"
            height="24"
            className="text-green-600"
            aria-labelledby="success-icon-title"
          />
        </div>
        <h2 className="text-xl font-medium">Check your email</h2>
        <p className="text-gray-500">
          We&apos;ve sent you a reset link. Please check your email and follow the instructions.
        </p>
        <Link href={AUTH_ROUTES.LOGIN}>
          <Button variant="link">Back to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@example.com" required />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending reset link..." : "Reset password"}
      </Button>

      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href={AUTH_ROUTES.LOGIN} className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}
