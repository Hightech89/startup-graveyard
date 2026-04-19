export type StartupComment = {
  id: string;
  userId: string;
  authorNickname?: string | null;
  authorEmail?: string | null;
  content: string;
  createdAt: string;
};
