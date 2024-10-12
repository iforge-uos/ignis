import { useUser } from "@/lib/utils";
import { Agreement } from "@ignis/types/root.ts";
import { useNavigate } from "@tanstack/react-router";
import { Badge, BadgeProps } from "@ui/components/ui/badge";
import { Card, CardContent } from "@ui/components/ui/card";
import { Separator } from "@ui/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle, ExternalLink, Tag } from "lucide-react";
import { useState } from "react";

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
      if (user_agreement.version === agreement.version) {
        return {
          status: "Signed",
          badgeVariant: "default",
          badgeStyle: "rounded-sm",
        };
      }
      return {
        status: "Needs Resigning",
        badgeVariant: "warning",
        badgeStyle: "rounded-sm",
      };
    }

    return {
      status: "Not Signed",
      badgeVariant: "warning",
      badgeStyle: "rounded-sm",
    };
  };

  const { status, badgeVariant, badgeStyle } = getAgreementStatus(agreement);

  return (
    <TooltipProvider>
      <motion.div
        className="relative overflow-hidden rounded-lg cursor-pointer w-full sm:w-[calc(50%-1rem)] lg:w-[40%]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleViewAgreement}
      >
        <Card className="bg-card dark:bg-card-dark border-border dark:border-border-dark overflow-hidden group w-full h-full">
          <CardContent className="p-0 relative w-full h-full">
            <div className="absolute top-4 right-4 transition-all duration-200">
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            </div>
            <div className="flex flex-col w-full h-full">
              <div className="w-full p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground-dark mb-2 sm:mb-0 sm:mr-4">
                    {agreement.name}
                  </h3>
                  <Badge
                    variant={badgeVariant as BadgeProps["variant"]}
                    className={`text-sm px-2 py-1 ${badgeStyle} mt-2 sm:mt-0`}
                  >
                    {status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {agreement.reasons.map((reason) => (
                    <Badge
                      key={reason.name}
                      variant="outline"
                      className="text-primary dark:text-primary-dark border-primary dark:border-primary-dark"
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      {reason.name}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className="text-muted-foreground dark:text-muted-foreground-dark border-muted-foreground dark:border-muted-foreground-dark"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(agreement.created_at).toLocaleDateString()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-muted-foreground dark:text-muted-foreground-dark border-muted-foreground dark:border-muted-foreground-dark"
                  >
                    v{agreement.version}
                  </Badge>
                </div>
              </div>
              <Separator orientation="horizontal" className="mt-auto" />
              <div className="w-full bg-popover dark:bg-popover-dark p-4 sm:p-6 flex flex-col justify-center items-center">
                {status === "Not Signed" ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="bg-warning text-warning-foreground p-3 rounded-lg inline-flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Action Required
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Review and sign on the agreement page</p>
                    </TooltipContent>
                  </Tooltip>
                ) : status === "Needs Resigning" ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="bg-warning text-warning-foreground p-3 rounded-lg inline-flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Needs Resigning
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Please review and sign the updated agreement version</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="bg-success text-success-foreground p-3 rounded-lg inline-flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        No Action Required
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">This agreement has been signed</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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
    </TooltipProvider>
  );
}
