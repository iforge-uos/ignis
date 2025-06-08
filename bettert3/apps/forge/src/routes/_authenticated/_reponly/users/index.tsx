import { getGravatarUrl } from "@/lib/utils";
import { PartialUser } from "@ignis/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@ignis/ui/components/ui/avatar";
import { Input } from "@ignis/ui/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@ignis/ui/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ignis/ui/components/ui/table";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

async function getUsers(pageNumber: number): Promise<PartialUser[]> {
  return [
    {
      username: "eik21jh",
      display_name: "Jim jam",
      email: "jhilton-balfe@sheffield.ac.uk",
      created_at: new Date(),
      id: "Somethhings cool",
      ucard_number: 69696969,
    },
  ];
}

function UserEntry({ display_name, email, ucard_number, created_at }: PartialUser) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={getGravatarUrl(email)} />
            <AvatarFallback>{display_name.split(" ").map((name) => name.at(0))}</AvatarFallback>
          </Avatar>
          {display_name}
        </div>
      </TableCell>
      <TableCell>{ucard_number}</TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>{created_at.toLocaleDateString()}</TableCell>
    </TableRow>
  );
}

const UsersIndexPageComponent = () => {
  // if (getRoles()?.some((role) => role === ADMIN)) {
  const [users, setUsers] = useState<PartialUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers(1);
      setUsers(users);
    };

    fetchUsers();
  }, []);
  // TODO datatable
  return (
    <div key="1" className="flex flex-col w-full min-h-screen p-4 md:p-6">
      <header className="flex items-center h-16 mb-6">
        <h1 className="text-2xl font-bold">Search Users</h1>
      </header>
      <div className="flex">
        <form className="flex-grow mb-6">
          <div className="flex items-center">
            <Search />
            <Input
              className="pl-8"
              id="search"
              placeholder="Search by name, UCard number, username, or email"
              type="search"
            />
          </div>
        </form>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>UCard Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserEntry key={user.id} {...user} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_authenticated/_reponly/users/")({
  component: UsersIndexPageComponent,
  beforeLoad: () => {
    throw notFound();
  },
});
