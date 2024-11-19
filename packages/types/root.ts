import { sign_in } from "@dbschema/interfaces";
import { PartialReason } from "./sign_in";
import { PartialUser } from "./users";

export type Agreement = {
  id: string;
  name: string;
  created_at: Date;
  content: string;
  version: number;
  reasons: { name: string }[];
};

export type SignIn = {
  user: PartialUser;
  reason: PartialReason;
  id: string;
  created_at: Date;
  ends_at: Date | null;
  duration: number;
  location: { name: sign_in.LocationName };
  signed_out: boolean | null;
  tools: string[];
};
