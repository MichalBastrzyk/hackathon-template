import { Suspense } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ProfileContent } from "./_components/profile-content";

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
          <div className="h-5 w-64 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`profile-skeleton-${i}`} className="space-y-2">
                <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
                <div className="h-5 w-full bg-zinc-200 rounded animate-pulse dark:bg-zinc-800" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
