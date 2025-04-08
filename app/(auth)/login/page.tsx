"use client";

import { Button, Input, Label } from "@/components/atoms";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    // Simulate API call (1 second delay)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, we would validate credentials and get a token from the server
    // For now, we'll just set a simple cookie to simulate auth
    // Set a cookie that expires in 1 day
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    document.cookie = `auth_session=demo_authenticated; expires=${expiryDate.toUTCString()}; path=/`;

    // Show success toast
    toast.success("Login successful! Welcome to Mentera-AI dashboard.");

    // Redirect to the return URL or dashboard
    router.push(returnUrl);
  };

  return (
    <>
      {/* Custom heading that overrides the default in AuthLayout */}
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold">Welcome to Mentera-AI</h1>
        <p className="text-muted-foreground">Please sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            placeholder="Enter password"
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </>
  );
}
