import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui";
import { ReviewResult } from "@/components/review";
import {
  reviewPullRequest,
  prUrlSchema,
  useReviewStore,
} from "@/features/review";
import { Loader2, PlayCircle, X, LogOut } from "lucide-react";
import { ZodError } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/pages/LoginPage";

function App() {
  const { prUrl, setPrUrl } = useReviewStore();
  const [error, setError] = useState<string>("");
  const [showDemo, setShowDemo] = useState<boolean>(false);
  const { user, authenticated, loading, logout, isGuestMode, login } =
    useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: reviewPullRequest,
    onError: (err: Error) => {
      setError(err.message || "Failed to review PR");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      prUrlSchema.parse(prUrl);
      mutation.mutate({ prUrl });
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "Invalid PR URL");
      }
    }
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Show login page if not authenticated and not in guest mode
  if (!authenticated && !isGuestMode) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="PR Review AI Logo"
              className="h-16 w-16 mb-3"
            />
            <h1 className="text-4xl font-bold tracking-tight">PR Review AI</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            LLM-Powered GitHub Pull Request Review Assistant
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Paste a GitHub PR URL and get instant AI-powered code review
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDemo(true)}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
            {authenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-200 text-sm">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : isGuestMode ? (
              <Button variant="default" size="sm" onClick={login}>
                Sign in with GitHub
              </Button>
            ) : null}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submit Pull Request</CardTitle>
            <CardDescription>
              {authenticated
                ? "Enter any GitHub pull request URL (public or private)"
                : "Enter a public GitHub pull request URL to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="https://github.com/owner/repo/pull/123"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  disabled={mutation.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={mutation.isPending || !prUrl}
                  className="sm:w-32"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reviewing
                    </>
                  ) : (
                    "Review PR"
                  )}
                </Button>
              </div>

              {!authenticated && (
                <p className="text-xs text-amber-600 font-medium">
                  ℹ️ Note: Currently in guest mode - supports public PRs only.{" "}
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="underline hover:text-amber-700"
                  >
                    Sign in with GitHub
                  </button>{" "}
                  to review private PRs.
                </p>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              {mutation.isPending && (
                <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md p-3">
                  Analyzing pull request... This may take 10-30 seconds.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {mutation.isSuccess && mutation.data && (
          <ReviewResult review={mutation.data} />
        )}
      </div>

      <AlertDialog open={showDemo} onOpenChange={setShowDemo}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>PR Review AI Demo</AlertDialogTitle>
            <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </AlertDialogCancel>
          </AlertDialogHeader>
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
            <video className="w-full h-full object-contain" controls autoPlay>
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
