import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/providers/auth";
import Header from "@/components/Header";
import RichEditor from "@/components/RichEditor";
import { Loader2, Save, Hash, Image, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const topics = [
  "Technology", "Design", "Productivity", "Creativity",
  "Leadership", "Wellness", "Writing", "Startup",
];

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: post, isLoading: postLoading } = trpc.post.byId.useQuery(
    { id: postId },
    { enabled: !isNaN(postId) }
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [coverImage, setCoverImage] = useState("");
  const [initialised, setInitialised] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?next=/edit/${postId}`, { replace: true });
    }
  }, [user, authLoading, navigate, postId]);

  // Pre-populate form once post data is loaded
  useEffect(() => {
    if (post && !initialised) {
      setTitle(post.title);
      setContent(post.content);
      setSelectedTopic(post.topic ?? undefined);
      setCoverImage(post.coverImage ?? "");
      setInitialised(true);
    }
  }, [post, initialised]);

  // Ownership check — redirect if this post belongs to someone else
  useEffect(() => {
    if (!postLoading && post && user && post.userId && post.userId !== user.id) {
      toast.error("You can only edit your own posts.");
      navigate(`/post/${postId}`, { replace: true });
    }
  }, [post, postLoading, user, postId, navigate]);

  const updatePost = trpc.post.update.useMutation({
    onSuccess: (data) => {
      utils.post.list.invalidate();
      utils.post.byId.invalidate({ id: postId });
      navigate(`/post/${data.id}`);
    },
    onError: (err) => {
      toast.error("Failed to save", { description: err.message });
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    updatePost.mutate({
      id: postId,
      title: title.trim(),
      content: content.trim(),
      topic: selectedTopic,
      coverImage: coverImage.trim() || "",
    });
  };

  const canSave = title.trim().length > 0 && content.trim().length > 0 && content !== "<p></p>" && initialised;

  if (authLoading || postLoading || !initialised) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 animate-pulse space-y-4">
          <div className="w-3/4 h-10 rounded bg-gray-200" />
          <div className="w-full h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-center">
          <p className="text-gray-500">Post not found.</p>
          <Link to="/" className="text-blue-600 text-sm hover:underline mt-4 inline-block">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-32">
        <div className="mb-8 pt-4">
          <Link to={`/post/${postId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft size={14} /> Back to post
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit article</h1>
        </div>

        {/* Cover image URL */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Cover image URL <span className="normal-case font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <Image size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
          {coverImage && (
            <div className="mt-2 rounded-lg overflow-hidden h-40 bg-gray-100">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            maxLength={200}
            className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-b-2 border-transparent focus:border-blue-500 focus:outline-none pb-3 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="mb-8">
          <RichEditor onChange={setContent} value={content} />
        </div>

        {/* Topic */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Topic <span className="normal-case font-normal text-gray-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(selectedTopic === topic ? undefined : topic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTopic === topic
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                <Hash size={10} />
                {topic.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/post/${postId}`)}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || updatePost.isPending}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-full transition-colors text-sm"
          >
            {updatePost.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
