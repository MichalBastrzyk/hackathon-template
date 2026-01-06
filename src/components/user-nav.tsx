"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useSession, authClient } from "@/lib/auth-client";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {session.user.name || session.user.email}
        </span>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/signin">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button size="sm">Sign Up</Button>
      </Link>
    </div>
  );
}
