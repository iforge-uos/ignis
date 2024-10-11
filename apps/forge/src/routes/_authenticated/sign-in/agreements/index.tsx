import { useUser } from "@/lib/utils";
import { getAgreements } from "@/services/root/getAgreements";
import { Agreement } from "@ignis/types/root";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge";
import { Loader } from "@ui/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table";

export default function Component() {
  const user = useUser()!;

  const {
    data: agreements,
    isLoading,
    isError,
  } = useQuery<Agreement[]>({
    queryKey: ["agreements"],
    queryFn: getAgreements,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !agreements) {
    return <div className="text-center">Error loading agreements</div>;
  }

  const getAgreementStatus = (agreement: Agreement) => {
    const user_agreement = user.agreements_signed.find((agreement_) => agreement.id === agreement_.id);
    if (user_agreement !== undefined) {
      if (user_agreement.version === agreement.version) {
        return "Signed";
      }
      return "Needs Resigning";
    }
    return "Not Signed";
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-5">Agreements</h1>
      <p className="accent-accent text-center">The signable agreements in the iForge.</p>

      <div className="flex justify-center mt-2">
        <Table className="max-w-xl mx-auto">
          <TableHeader className="bg-accent rounded-md">
            <TableRow>
              <TableHead>Reasons</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Version</TableHead>
              <TableHead>Updated at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements.map((agreement) => (
                <Link
                    key={agreement.id}
                    to="/signin/agreements/$id"
                    params={agreement}
                    className="contents"
                >
                  <TableRow className="hover:bg-accent hover:cursor-pointer">
                    <TableCell>{agreement.reasons.map((reason) => reason.name).join(", ")}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Badge variant="outline" className="rounded-md">
                          {getAgreementStatus(agreement)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{agreement.version}</TableCell>
                    <TableCell>{new Date(agreement.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                </Link>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/sign-in/agreements/")({
  component: Component,
});
