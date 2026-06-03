import { postRouter } from "./post-router";
import { likeRouter } from "./like-router";
import { commentRouter } from "./comment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  post: postRouter,
  like: likeRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
