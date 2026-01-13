"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type VerificationState = "pending" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("pending");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setState("verifying");
    try {
      const result = await authClient.verifyEmail({
        query: {
          token: verificationToken,
        },
      });

      if (result.error) {
        setState("error");
        setError(result.error.message || "Failed to verify email.");
      } else {
        setState("success");
      }
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Failed to verify email.");
    }
  }, []);

  useEffect(() => {
    // Handle error from redirect
    if (errorParam) {
      setState("error");
      if (errorParam === "invalid_token") {
        setError("The verification link is invalid or has expired.");
      } else {
        setError("An error occurred during verification.");
      }
      return;
    }

    // Handle token verification
    if (token) {
      verifyEmail(token);
    }
  }, [token, errorParam, verifyEmail]);

  async function handleResendEmail() {
    if (!email) return;
    setResending(true);
    setResendSuccess(false);

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth/verify-email",
      });
      setResendSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  // Verifying state
  if (state === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your account is now fully activated. You can sign in to access
                your account.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Verification Failed
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {email ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Would you like us to send a new verification email to{" "}
                    <strong>{email}</strong>?
                  </p>
                  {resendSuccess && (
                    <p className="text-green-600 text-sm dark:text-green-400">
                      Verification email sent! Please check your inbox.
                    </p>
                  )}
                  <Button
                    onClick={handleResendEmail}
                    className="w-full"
                    disabled={resending}
                  >
                    {resending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Please try signing up again or contact support if the problem
                  persists.
                </p>
              )}
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending state (initial - waiting for user to check email)
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>We've sent you a verification link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {email ? (
                <>
                  We've sent a verification email to <strong>{email}</strong>.
                  Please click the link in the email to verify your account.
                </>
              ) : (
                <>
                  Please check your email and click the verification link to
                  complete your registration.
                </>
              )}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              The link will expire in 24 hours. If you don't see the email,
              check your spam folder.
            </p>
            {email && (
              <>
                {resendSuccess && (
                  <p className="text-green-600 text-sm dark:text-green-400">
                    Verification email sent! Please check your inbox.
                  </p>
                )}
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend Verification Email"}
                </Button>
              </>
            )}
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
