export type Agreement = {
  id: string;
  name: string;
  created_at: Date;
  content: string;
  version: number;
  reasons: { name: string }[];
};
