import { Skeleton } from "@/components/atoms";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col gap-4 items-center">
        <Skeleton className="h-12 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
