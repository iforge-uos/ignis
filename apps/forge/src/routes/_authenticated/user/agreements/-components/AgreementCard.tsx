import { Badge } from "@packages/ui/components/badge";
import { Card, CardContent } from "@packages/ui/components/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle, ExternalLink, Tag } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Category } from "@/icons/SignInReason";
import { cn } from "@/lib/utils";

interface AgreementCardProps {
  agreement: Agreement;
}

export function AgreementCard({ agreement }: AgreementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const user = useUser()!;

  const handleViewAgreement = () => {
    navigate({ to: "/sign-in/agreements/$id", params: agreement });
  };

  const getAgreementStatus = (agreement: Agreement) => {
    const user_agreement = user.agreements_signed.find((agreement_) => agreement.id === agreement_.id);

    if (user_agreement !== undefined) {
      if (user_agreement["@version_signed"] === agreement.version) {
        return {
          status: "Signed",
          badgeVariant: "default",
          label: "No Action Required",
          tooltip: "This agreement has been signed",
          style: "bg-success text-success-foreground",
          Icon: CheckCircle,
        };
      }
      return {
        status: "Needs Resigning",
        badgeVariant: "warning",
        label: "Needs Resigning",
        tooltip: "Please review and sign the updated agreement version",
        style: "bg-warning text-warning-foreground",
        Icon: AlertCircle,
      };
    }

    return {
      status: "Not Signed",
      badgeVariant: "warning",
      label: "Action Required",
      tooltip: "Review and sign on the agreement page",
      style: "bg-warning text-warning-foreground",
      Icon: AlertCircle,
    };
  };

  const { label, tooltip, style, Icon } = getAgreementStatus(agreement);

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg cursor-pointer w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleViewAgreement}
    >
      <Card className="bg-card dark:bg-card-dark border-border dark:border-border-dark overflow-hidden group py-2 w-full h-full">
        <CardContent className="p-0 relative w-full h-full">
          <div className="absolute top-4 right-4 transition-all duration-200">
            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>
          <div className="flex flex-col w-full h-full">
            <div className="w-full p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground-dark mb-2 sm:mb-0 sm:mr-4">
                  {agreement.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-muted-foreground dark:text-muted-foreground-dark border-muted-foreground dark:border-muted-foreground-dark"
                >
                  v{agreement.version}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground dark:text-muted-foreground-dark border-muted-foreground dark:border-muted-foreground-dark cursor-pointer"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(agreement.updated_at.epochMilliseconds, "PPP")}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Last updated</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground dark:text-muted-foreground-dark border-muted-foreground dark:border-muted-foreground-dark cursor-pointer"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {agreement.reasons.length} reason{agreement.reasons.length !== 1 ? "s" : ""}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Sign-in reasons:</p>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {agreement.reasons.map((reason) => (
                          <Badge key={reason.id} variant="default" className="rounded-sm shadow-sm text-xs">
                            <Category category={reason.category} className="mr-1 h-3 w-3" />
                            {reason.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="w-full p-2 sm:p-4 flex flex-col justify-center items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("p-3 rounded-lg inline-flex items-center", style)}>
                    <Icon className="h-5 w-5 mr-2" />
                    {label}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
      <motion.div
        className="absolute inset-0 bg-gray-600/5 dark:bg-gray-500/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
