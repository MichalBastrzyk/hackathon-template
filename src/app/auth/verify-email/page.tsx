import { Suspense } from "react";

import { VerifyEmailContent } from "./_components/verify-email-content";

function VerifyEmailSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
        <div className="h-4 w-full bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
        <div className="h-48 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
