"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            Password reset functionality coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Password reset via email is not yet configured. Please contact
              support for assistance.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
