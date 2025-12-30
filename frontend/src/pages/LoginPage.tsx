import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Github, UserCircle } from "lucide-react";

export function LoginPage() {
  const { login, continueAsGuest } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/logo.png" alt="PR Review AI" className="h-20 w-20" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">PR Review AI</CardTitle>
            <CardDescription className="text-base mt-2">
              AI-powered GitHub Pull Request reviews
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={login} className="w-full h-12 text-base" size="lg">
            <Github className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            onClick={continueAsGuest}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Continue as Guest
          </Button>

          <div className="text-sm text-muted-foreground space-y-2 pt-4">
            <p className="font-medium">Guest mode:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Review public PRs only</li>
              <li>No authentication required</li>
            </ul>
            <p className="font-medium pt-2">GitHub sign in:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Review private PRs</li>
              <li>Full repository access</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
