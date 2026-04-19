export type Startup = {
  id: string;
  /** Present when loaded for detail, profile, or owner flows. Omitted on anonymous home list. */
  userId?: string;
  /** Optional author display name (nickname when available). */
  authorName?: string;
  /** Author email used as fallback when nickname is missing. */
  authorEmail?: string;
  name: string;
  shortDescription: string;
  causeOfDeath: string;
  finalLesson: string;
  tags: string[];
  upvotes: number;
  createdAt: string;
};
