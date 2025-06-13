import Title from "@/components/title";
import { Button } from "@packages/ui/components/button";
import { toast } from "sonner";

const EmailIndexPage = () => {
  const handleSendEmail = async () => {
    try {
      // TODO: Replace with ORPC endpoint when email API is implemented
      toast.info("Email functionality not yet migrated to ORPC");
      console.log("Email sending would happen here");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Title prompt="Emails" />
      <div className="p-6 bg-card rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Test Email Sending</h3>
        <Button onClick={handleSendEmail}>Send Email to Self</Button>
      </div>
    </div>
  );
};

export const Route = createFileRoute({
  component: EmailIndexPage,
});
