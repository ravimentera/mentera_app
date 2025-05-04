import { STATIC_ROUTES } from "@/app/constants/route-constants";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 py-4">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Mentera-AI. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href={STATIC_ROUTES.TERMS} className="text-gray-400 hover:text-white">
            Terms
          </Link>
          <Link href={STATIC_ROUTES.PRIVACY} className="text-gray-400 hover:text-white">
            Privacy
          </Link>
          <Link href={STATIC_ROUTES.CONTACT} className="text-gray-400 hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
