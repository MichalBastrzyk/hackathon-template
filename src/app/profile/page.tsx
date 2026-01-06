import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/server/auth/config";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-3xl text-zinc-900 tracking-tight dark:text-zinc-50">
            Profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your account information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email Verified
              </p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {session.user.emailVerified ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                User ID
              </p>
              <p className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {session.user.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
