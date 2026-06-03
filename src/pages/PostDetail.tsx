import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/providers/auth";
import { getFingerprint } from "@/lib/fingerprint";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, MessageCircle, Clock, ArrowLeft, Send, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import { toast } from "sonner";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const fingerprint = getFingerprint();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: post, isLoading: postLoading } = trpc.post.byId.useQuery(
    { id: postId },
    { enabled: !isNaN(postId) }
  );

  const { data: commentsData, refetch: refetchComments } = trpc.comment.list.useQuery(
    { postId },
    { enabled: !isNaN(postId) }
  );

  const { data: likeData, refetch: refetchLikes } = trpc.like.count.useQuery(
    { postId, fingerprint },
    { enabled: !isNaN(postId) }
  );

  const likeMutation = trpc.like.toggle.useMutation({
    onSuccess: () => {
      refetchLikes();
      setLikeAnimating(false);
    },
  });

  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate();
      toast.success("Post deleted.");
      navigate("/");
    },
    onError: (err) => {
      toast.error("Failed to delete post", { description: err.message });
    },
  });

  const commentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setCommentAuthor("");
      setCommentText("");
      refetchComments();
    },
  });

  const handleLike = () => {
    if (likeAnimating) return;
    setLikeAnimating(true);
    likeMutation.mutate({ postId, fingerprint });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;
    commentMutation.mutate({ postId, authorName: commentAuthor.trim(), content: commentText.trim() });
  };

  const liked = likeData?.liked ?? false;
  const likeCount = likeData?.count ?? 0;
  const comments = commentsData ?? [];

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 animate-pulse space-y-5">
          <div className="w-24 h-5 rounded-full bg-gray-200" />
          <div className="w-3/4 h-10 rounded bg-gray-200" />
          <div className="w-1/2 h-5 rounded bg-gray-200" />
          <div className="mt-10 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="w-full h-4 rounded bg-gray-200" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
            <ArrowLeft size={15} />Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Strip HTML tags for word count (content may now be HTML from TipTap)
  const plainText = post.content.replace(/<[^>]*>/g, " ");
  const readTime = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 200));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-gray-100">
        <div
          className="h-full bg-blue-600 transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <Header />

      {/* Cover image */}
      {post.coverImage && (
        <div className="w-full h-56 sm:h-72 md:h-96 overflow-hidden mt-14">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <main className={`max-w-3xl mx-auto px-4 sm:px-6 pb-20 ${post.coverImage ? "pt-8" : "pt-20"}`}>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={15} />Back to feed
        </Link>

        {post.topic && (
          <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full mb-4">
            #{post.topic.toLowerCase()}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-5">
          {post.title}
        </h1>

        {/* Author + meta */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(post.authorName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">{post.authorName}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "Recently"}</span>
              <span>·</span>
              <Clock size={11} />
              <span>{readTime} min read</span>
            </div>
          </div>
          {/* Inline reactions + owner actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${liked ? "text-red-500" : "text-gray-400 hover:text-red-500"} ${likeAnimating ? "scale-125" : ""}`}
            >
              <Heart size={18} className={liked ? "fill-current" : ""} />
              <span className="font-medium">{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle size={18} />
              <span>{comments.length}</span>
            </div>
            {/* Edit / Delete — shown only to the post owner */}
            {user && post.userId === user.id && (
              <>
                <Link
                  to={`/edit/${post.id}`}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit post"
                >
                  <Pencil size={15} />
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 size={15} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The post and all its comments will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate({ id: post.id })}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Pull quote excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed italic mb-8 border-l-4 border-blue-500 pl-5">
            {post.excerpt}
          </p>
        )}

        {/* Article body */}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* Bottom reactions */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all duration-200 ${liked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{comments.length}</span>
          </div>
        </div>

        {/* Comments */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {comments.length > 0
              ? `${comments.length} Comment${comments.length > 1 ? "s" : ""}`
              : "Leave a comment"}
          </h2>

          <form onSubmit={handleComment} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a thoughtful comment..."
              rows={4}
              maxLength={2000}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentMutation.isPending || !commentAuthor.trim() || !commentText.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
              >
                {commentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post comment
              </button>
            </div>
          </form>

          {comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-semibold">
                      {getInitials(c.authorName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.authorName}</p>
                      <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}