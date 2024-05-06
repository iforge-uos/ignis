import { createFileRoute } from "@tanstack/react-router";
import Title from "@/components/title";
import { Button } from "@ui/components/ui/button.tsx";
import axiosInstance from "@/api/axiosInstance.ts";

const EmailIndexPage = () => {
  const handleSendEmail = async () => {
    try {
      await axiosInstance.post("/test_email"); // Make the POST request to the endpoint
      console.log("Email sent successfully");
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

export const Route = createFileRoute("/_authenticated/admin/notifications/email/")({
  component: EmailIndexPage,
});
