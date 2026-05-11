export type Startup = {
  id: string;
  /** Present when loaded for detail, profile, or owner flows. Omitted on anonymous home list. */
  userId?: string;
  /** Optional author display name (nickname when available). */
  authorName?: string;
  name: string;
  shortDescription: string;
  causeOfDeath: string;
  finalLesson: string;
  tags: string[];
  upvotes: number;
  createdAt: string;
};
