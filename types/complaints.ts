export type ComplaintStatus =
  | "pending"
  | "in-progress"
  | "resolved";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt?: string;
}