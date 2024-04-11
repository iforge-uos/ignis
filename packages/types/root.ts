export type Agreement = {
  id: string;
  created_at: Date;
  content: string;
  version: number;
  reasons: { name: string }[];
};
