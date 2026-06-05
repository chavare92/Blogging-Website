import { z } from "zod";
import { eq, desc, sql, ilike, or, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, protectedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { posts, likes, comments } from "@db/schema";

export const postRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        topic: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Build WHERE conditions (before GROUP BY — PostgreSQL compatible)
      const conditions = [];

      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            ilike(posts.title, searchTerm),
            ilike(posts.content, searchTerm),
            ilike(posts.excerpt, searchTerm)
          )
        );
      }

      if (input?.topic) {
        conditions.push(eq(posts.topic, input.topic));
      }

      const baseQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          excerpt: posts.excerpt,
          topic: posts.topic,
          authorName: posts.authorName,
          authorAvatar: posts.authorAvatar,
          coverImage: posts.coverImage,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          likeCount: sql<number>`COUNT(DISTINCT ${likes.id})`.as("likeCount"),
          commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`.as("commentCount"),
        })
        .from(posts)
        .leftJoin(likes, eq(likes.postId, posts.id))
        .leftJoin(comments, eq(comments.postId, posts.id))
        .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined)
        .groupBy(posts.id)
        .orderBy(desc(posts.publishedAt));

      return await baseQuery;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),

  create: protectedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        topic: z.string().optional(),
        coverImage: z.string().url().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const plainContent = input.content.replace(/<[^>]*>/g, " ");
      const excerpt =
        plainContent.length > 200
          ? plainContent.substring(0, 200) + "..."
          : plainContent;

      const [newPost] = await db.insert(posts).values({
        userId: ctx.user.id,
        title: input.title,
        content: input.content,
        excerpt,
        topic: input.topic || null,
        authorName: ctx.user.displayName,
        coverImage: input.coverImage || null,
      }).returning();

      return newPost;
    }),

  update: protectedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        topic: z.string().optional(),
        coverImage: z.string().url().max(500).optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [existing] = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      if (existing.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own posts." });

      const plainContent = input.content.replace(/<[^>]*>/g, " ");
      const excerpt =
        plainContent.length > 200
          ? plainContent.substring(0, 200) + "..."
          : plainContent;

      const [updated] = await db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
          excerpt,
          topic: input.topic || null,
          coverImage: input.coverImage || null,
        })
        .where(eq(posts.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [existing] = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      if (existing.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own posts." });

      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});