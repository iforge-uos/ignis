import axiosInstance from "@/api/axiosInstance";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Title from "@/components/title";
import { sleep } from "@/lib/utils";
import { getAgreements } from "@/services/root/getAgreements";
import { search } from "@/services/users/search";
import { Agreement } from "@ignis/types/root";
import { User } from "@ignis/types/users";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const OutComponent = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [agreement, setAgreement] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const fetchedAgreements = await getAgreements();
      setAgreements(fetchedAgreements);
      // Set default to User Agreement
      const userAgreement = fetchedAgreements.find((a) => a.name === "User Agreement");
      if (userAgreement) {
        setAgreement(userAgreement.id);
      }
    })();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await search(searchQuery);
        setUsers(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async () => {
    const hasUserAndAgreement = user && agreement;
    if (!hasUserAndAgreement) {
      toast.error("Please select both a user and an agreement");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/users/${user.id}/sign-agreements/${agreement}`);
      toast.success(`Agreement signed for ${user.display_name || user.username}`);
      await sleep(3_000);
      throw redirect({ to: "/sign-in" });
    } catch (error) {
      console.error("Error signing agreement:", error);
      toast.error("Failed to sign agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-4 mt-1">
        <Title prompt="Sign User Agreement" />
        <ActiveLocationSelector />
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="user-search" className="block text-sm font-medium mb-2">
              User (type username, name or ucard number)
            </label>
            <Input
              id="user-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for user..."
              className="w-full"
            />
            {isSearching && <p className="text-sm text-muted-foreground mt-1">Searching...</p>}
            {users.length > 0 && (
              <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                {users.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() => {
                      setUser(result);
                      setSearchQuery(result.display_name || result.username);
                      setUsers([]);
                    }}
                    className="w-full text-left p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium">{result.display_name || result.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.email} • UCard: {result.ucard_number}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {user && (
              <div className="mt-2 p-2 bg-accent rounded-md">
                <p className="text-sm">
                  Selected: <strong>{user.display_name || user.username}</strong> ({user.email})
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="agreement-select" className="block text-sm font-medium mb-2">
              Agreement
            </label>
            <p className="text-sm text-muted-foreground mb-2">
              They probably want the user agreement but you can change if you want for some reason
            </p>
            <Select value={agreement || ""} onValueChange={setAgreement}>
              <SelectTrigger id="agreement-select" className="w-full">
                <SelectValue placeholder="Select an agreement" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {agreements.map((agreement) => (
                    <SelectItem key={agreement.id} value={agreement.id}>
                      {agreement.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={!(user && agreement ) || isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/sign-in/actions/sign-agreement")({
  component: OutComponent,
});
