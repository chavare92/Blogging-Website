import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { comments } from "@db/schema";

export const commentRouter = createRouter({
  list: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return await db
        .select()
        .from(comments)
        .where(eq(comments.postId, input.postId))
        .orderBy(desc(comments.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        postId: z.number(),
        authorName: z.string().min(1).max(100),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [newComment] = await db.insert(comments).values({
        postId: input.postId,
        authorName: input.authorName,
        content: input.content,
      }).returning();

      return newComment;
    }),
});

