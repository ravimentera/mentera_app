import { STATIC_ROUTES } from "@/app/constants/route-constants";
import { Button } from "@/components/atoms";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href={STATIC_ROUTES.HOME}>Return Home</Link>
      </Button>
    </div>
  );
}
