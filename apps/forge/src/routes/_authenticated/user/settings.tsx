import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/components/avatar";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Trash2, Unlink } from "lucide-react";
import { useCallback } from "react";
import DiscordIcon from "@/../public/icons/discord.svg?react";
import GitHubIcon from "@/../public/icons/github.svg?react";
import Title from "@/components/title";
import { client } from "@/lib/orpc";

const UserSettingsPageComponent = () => {
  const integrations = Route.useLoaderData();

  const githubIntegration = integrations.find((i) => i.platform === "GITHUB");
  const discordIntegration = integrations.find((i) => i.platform === "DISCORD");

  const handleConnectGitHub = useCallback(() => {
    // Redirect to OAuth flow for GitHub
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/?provider=builtin::oauth_github`;
  }, []);

  const handleConnectDiscord = useCallback(() => {
    // Redirect to OAuth flow for Discord
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/oauth/?provider=builtin::oauth_discord`;
  }, []);

  const handleUnlinkGitHub = useCallback(() => {
    // TODO: Implement unlink functionality
    console.log("Unlinking GitHub account");
  }, []);

  const handleUnlinkDiscord = useCallback(() => {
    // TODO: Implement unlink functionality
    console.log("Unlinking Discord account");
  }, []);

  const handleDeleteAccount = () => {
    console.log("Deleting account");
  };

  return (
    <>
      <Title prompt="Account Settings" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your integrations and account preferences</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitHubIcon className="h-5 w-5 fill-current" />
                  GitHub Integration
                </CardTitle>
                <CardDescription>Connect your GitHub account to sync repositories and manage code</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {githubIntegration ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={githubIntegration.data?.avatar_url}
                            alt={`${githubIntegration.data?.login}'s GitHub avatar`}
                          />
                          <AvatarFallback>
                            <div className="h-10 w-10 bg-foreground rounded-full flex items-center justify-center">
                              <GitHubIcon className="h-5 w-5 fill-background" />
                            </div>
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <a
                            href={githubIntegration.data?.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-lg text-primary link-underline"
                          >
                            @{githubIntegration.data?.login}
                          </a>
                          <p className="text-xs text-muted-foreground">Connected to GitHub</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={handleUnlinkGitHub}>
                          <Unlink className="size-4 mr-1" />
                          Unlink
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">GitHub Connection</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect your GitHub account to access repositories
                      </p>
                    </div>
                    <Button onClick={handleConnectGitHub} size="sm">
                      Connect GitHub
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <DiscordIcon className="h-5 w-5 fill-current" />
                  Discord Integration
                </CardTitle>
                <CardDescription>Connect your Discord account for notifications and community features</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {discordIntegration ? (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://cdn.discordapp.com/avatars/${discordIntegration.external_id}/${discordIntegration.data.avatar}.png`}
                            alt={`${discordIntegration.data?.global_name || discordIntegration.data?.username}'s Discord avatar`}
                          />
                          <AvatarFallback>
                            <div className="h-10 w-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                              <DiscordIcon className="h-5 w-5 fill-white" />
                            </div>
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <a
                            href={`https://discord.com/users/${discordIntegration.external_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-lg text-primary link-underline"
                          >
                            {discordIntegration.data?.global_name || discordIntegration.data?.username}
                          </a>
                          <p className="text-xs text-muted-foreground">Connected to Discord</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={handleUnlinkDiscord}>
                          <Unlink className="size-4 mr-1" />
                          Unlink
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Discord Connection</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect your Discord account for real-time updates
                      </p>
                    </div>
                    <Button onClick={handleConnectDiscord} size="sm">
                      Connect Discord
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>

            <Card className="border-destructive-foreground/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  Account Deletion
                </CardTitle>
                <CardDescription>Permanently delete your account and all associated data</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-destructive/5 border border-destructive-foreground/20 text-destructive-foreground rounded-lg p-3 mb-3">
                  <h4 className="text-sm font-medium mb-1">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/user/settings")({
  loader: async ({ context }) => client.users.integrations(context.user),
  component: UserSettingsPageComponent,
});
