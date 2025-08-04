import { createFileRoute } from "@tanstack/react-router"
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { useUserRoles } from "@/hooks/useUserRoles";
import SignInActionsManager from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInManager";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import {} from "@tanstack/react-router";
import { Book, Coins, MessageCircleMore, ShoppingCart } from "lucide-react";


const SignInIndexAppComponent = () => {
  const items = [
    {
      title: "iForge Discord",
      description: "Join the iForge Discord if you haven't already.",
      icon: <MessageCircleMore className="h-8 w-8 text-neutral-500" />,
      linkText: "Join",
      externalLink: "https://iforge.sheffield.ac.uk/discord",
    },
    {
      title: "Top up till credit",
      description: "Add money to your till balance to make purchases in the iForge.",
      icon: <Coins className="h-8 w-8 text-neutral-500" />,
      linkText: "Top Up",
      externalLink: "https://onlinepayments.shef.ac.uk/papercut",
    },
  ];
  const roles = useUserRoles();
  const isRep = roles.some((role) => role === "rep");
  const isAdmin = roles.some((role) => role === "admin");

  if (isRep) {
    items.push(
      {
        title: "Purchase Form",
        description: "Add Items that need to be purchased to the list via the purchase form!",
        icon: <ShoppingCart className="h-8 w-8 text-neutral-500" />,
        linkText: "Buy",
        externalLink:
          "https://docs.google.com/forms/d/e/1FAIpQLScdLTE7eXqGQRa3e0UfymYo8qjlNTyu5xfIyArMG0wGQgHjyw/viewform",
      },
      {
        title: "iDocs",
        description: "Check out your team specific documentation here (coming soon)",
        icon: <Book className="h-8 w-8 text-neutral-500" />,
        linkText: "Learn",
        externalLink: "https://docs.iforge.shef.ac.uk",
      },
    );
  }

  return (
    <>
      <Title prompt="Sign In App Home" />
      <div className="p-4 mt-1">
        <ActiveLocationSelector />
        <div className="border-2 rounded-md p-4">
          <h1 className="text-xl font-bold mb-4 text-center">Sign in Home</h1>
          {isAdmin && (
            <>
              <div className="mb-2">
                <SignInActionsManager />
              </div>
              <Separator className="mb-2" />
            </>
          )}
          <div className="flex flex-col-reverse md:flex-row">
            <div className="md:w-1/2 flex justify-center items-center p-4">
              <div className="aspect-square relative w-full h-full">
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center items-center">
              <div className="grid grid-cols-1 gap-4 mx-auto">
                {/* Use mx-auto for horizontal centering */}
                {items.map((item) => (
                  <Card key={item.title} className="shadow-md rounded-md p-4 max-w-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {/* Use items-center for vertical alignment */}
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-balance">{item.description}</CardContent>
                    <CardFooter>
                      <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                        <Button>{item.title}</Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/sign-in/")({
  component: SignInIndexAppComponent,
});
