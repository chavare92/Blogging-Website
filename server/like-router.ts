import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { likes } from "@db/schema";

export const likeRouter = createRouter({
  count: publicQuery
    .input(z.object({ postId: z.number(), fingerprint: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [countRow, myLikeRow] = await Promise.all([
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(likes)
          .where(eq(likes.postId, input.postId)),
        db
          .select()
          .from(likes)
          .where(
            and(
              eq(likes.postId, input.postId),
              eq(likes.fingerprint, input.fingerprint)
            )
          )
          .limit(1),
      ]);
      return {
        count: Number(countRow[0]?.count ?? 0),
        liked: !!myLikeRow[0],
      };
    }),

  toggle: publicQuery
    .input(z.object({ postId: z.number(), fingerprint: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.postId, input.postId),
            eq(likes.fingerprint, input.fingerprint)
          )
        )
        .limit(1);

      let liked: boolean;
      if (existing[0]) {
        await db.delete(likes).where(eq(likes.id, existing[0].id));
        liked = false;
      } else {
        await db.insert(likes).values({
          postId: input.postId,
          fingerprint: input.fingerprint,
        });
        liked = true;
      }

      const [countRow] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(likes)
        .where(eq(likes.postId, input.postId));

      return { liked, count: Number(countRow?.count ?? 0) };
    }),
});

